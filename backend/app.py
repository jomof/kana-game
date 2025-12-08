from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import yaml
import glob
from pathlib import Path
from srs_adapter import FsrsSQLiteScheduler
import json
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize FSRS engine
DATA_DIR = Path(__file__).parent / "data"

def log_transaction(user, request_data, response_data):
    if not user:
        user = "default"

    log_file = DATA_DIR / f"{user}.log"

    timestamp = datetime.datetime.now().isoformat()
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{timestamp} REQUEST: {json.dumps(request_data, ensure_ascii=False)}\n")
            f.write(f"{timestamp} RESPONSE: {json.dumps(response_data, ensure_ascii=False)}\n")
    except Exception as e:
        print(f"Failed to log transaction: {e}")

def get_engine(user):
    """Create a new engine instance for each request to avoid thread issues."""
    if not user:
        user = "default"
    return FsrsSQLiteScheduler.for_user(user, DATA_DIR)

QUESTIONS_CACHE = {
    'timestamp': 0,
    'data': []
}

def get_questions():
    global QUESTIONS_CACHE
    sentences_dir = DATA_DIR / "sentences"
    sentences_dir.mkdir(parents=True, exist_ok=True)
    
    files = sorted(glob.glob(str(sentences_dir / "*.yml")) + glob.glob(str(sentences_dir / "*.yaml")))
    if not files:
        return []

    # Get the latest modification time
    max_mtime = max(os.path.getmtime(f) for f in files)
    
    if max_mtime > QUESTIONS_CACHE['timestamp']:
        print("Reloading questions...")
        questions = []
        for f in files:
            with open(f, 'r', encoding='utf-8') as stream:
                try:
                    data = yaml.safe_load(stream)
                    if data:
                        if isinstance(data, list):
                            questions.extend(data)
                        elif isinstance(data, dict) and 'examples' in data:
                            for ex in data['examples']:
                                prompt = ex.get('english')
                                japanese_answers = ex.get('japanese', [])
                                cleaned_answers = [ans.replace('{', '').replace('}', '') for ans in japanese_answers]
                                if prompt and cleaned_answers:
                                    questions.append({
                                        "prompt": prompt,
                                        "answers": cleaned_answers
                                    })
                except yaml.YAMLError as exc:
                    print(exc)
        QUESTIONS_CACHE['timestamp'] = max_mtime
        QUESTIONS_CACHE['data'] = questions
        
    return QUESTIONS_CACHE['data']

@app.route('/api', methods=['POST'])
def json_rpc():
    request_data = None
    response_data = None
    user = None

    try:
        request_data = request.get_json()
        if not request_data:
            response_data = {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": None}
        else:
            method = request_data.get("method")
            params = request_data.get("params", [])
            req_id = request_data.get("id")

            user = params.get("user") if isinstance(params, dict) else None
            if user:
                print(f"Request from user: {user}")
            
            engine = get_engine(user)

            if method == "getNextQuestion":
                # Try to get next due question from SRS
                next_key = engine.get_next_question()
                all_questions = get_questions()
                question = None
                srs_log_msg = None
                if next_key:
                    for q in all_questions:
                        if q["prompt"] == next_key:
                            question = q
                            srs_log_msg = f"SRS: Selected due question '{q['prompt']}'"
                            break
                if not question:
                    for q in all_questions:
                        if not engine.has_card(q["prompt"]):
                            question = q
                            srs_log_msg = f"SRS: Selected never-reviewed question '{q['prompt']}'"
                            break
                if not question and all_questions:
                    candidates = [q for q in all_questions if not engine.is_busy(q["prompt"], 15)]
                    if candidates:
                        question = random.choice(candidates)
                        srs_log_msg = f"SRS: Selected random non-busy question '{question['prompt']}'"
                    else:
                        never_reviewed = [q for q in all_questions if not engine.has_card(q["prompt"])]
                        if never_reviewed:
                            question = random.choice(never_reviewed)
                            srs_log_msg = f"SRS: Selected random never-reviewed question '{question['prompt']}'"
                        else:
                            srs_log_msg = "SRS: All questions are busy and have been reviewed. No question selected."
                            response_data = {
                                "jsonrpc": "2.0",
                                "result": None,
                                "error": {
                                    "code": 429,
                                    "message": "All questions are in cooldown. Please wait before reviewing again."
                                }
                            }
                            # Log SRS action
                            log_transaction(user, {"method": "getNextQuestion"}, {"srs": srs_log_msg})
                            return jsonify(response_data)
                response_data = {
                    "jsonrpc": "2.0",
                    "result": question,
                    "id": req_id
                }
                # Log SRS action
                if srs_log_msg:
                    log_transaction(user, {"method": "getNextQuestion"}, {"srs": srs_log_msg})
            

            elif method == "provideAnswer":
                # Expecting params to be a dict or list, but let's handle dict for named params
                # or just log whatever we get
                print(f"Received answer: {params}")
                
                if isinstance(params, dict):
                    question_prompt = params.get("question")
                    score = params.get("score")
                    
                    if question_prompt:
                        if score is None or score == -1:
                            print(f"Skipping SRS record for '{question_prompt}' (score: {score})")
                            try:
                                engine.bury_card(question_prompt, 15)
                                print(f"Buried card '{question_prompt}' for 15 minutes")
                            except Exception as e:
                                print(f"Error burying card: {e}")
                        else:
                            try:
                                # Pass score directly (0-100) to the SRS engine
                                engine.record_answer(question_prompt, int(score))
                                print(f"Recorded SRS answer for '{question_prompt}': {score}")
                            except Exception as e:
                                print(f"Error recording SRS answer: {e}")

                response_data = {
                    "jsonrpc": "2.0",
                    "result": "ok",
                    "id": req_id
                }
            
            else:
                response_data = {
                    "jsonrpc": "2.0",
                    "error": {"code": -32601, "message": "Method not found"},
                    "id": req_id
                }

    except Exception as e:
        response_data = {"jsonrpc": "2.0", "error": {"code": -32603, "message": "Internal error", "data": str(e)}, "id": None}

    if request_data:
        log_transaction(user, request_data, response_data)

    return jsonify(response_data)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
