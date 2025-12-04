from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import yaml
import glob
from pathlib import Path
from srs_engine import FsrsSQLiteScheduler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize FSRS engine
DATA_DIR = Path(__file__).parent / "data"
ENGINES = {}

def get_engine(user):
    if not user:
        user = "default"
    if user not in ENGINES:
        ENGINES[user] = FsrsSQLiteScheduler.for_user(user, DATA_DIR)
    return ENGINES[user]

QUESTIONS_CACHE = {
    'timestamp': 0,
    'data': []
}

def get_questions():
    global QUESTIONS_CACHE
    sentences_dir = DATA_DIR / "sentences"
    sentences_dir.mkdir(parents=True, exist_ok=True)
    
    files = sorted(glob.glob(str(sentences_dir / "*.yml")))
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
                        questions.extend(data)
                except yaml.YAMLError as exc:
                    print(exc)
        QUESTIONS_CACHE['timestamp'] = max_mtime
        QUESTIONS_CACHE['data'] = questions
        
    return QUESTIONS_CACHE['data']

@app.route('/api', methods=['POST'])
def json_rpc():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": None})

        method = data.get("method")
        params = data.get("params", [])
        req_id = data.get("id")

        user = params.get("user") if isinstance(params, dict) else None
        if user:
            print(f"Request from user: {user}")
        
        engine = get_engine(user)

        if method == "getNextQuestion":
            # Try to get next due question from SRS
            next_key = engine.get_next_question()
            
            all_questions = get_questions()
            
            question = None
            if next_key:
                # Find the question object for this key
                for q in all_questions:
                    if q["prompt"] == next_key:
                        question = q
                        break
            
            # If no question is due (or key not found), pick the next new question
            if not question:
                for q in all_questions:
                    if not engine.has_card(q["prompt"]):
                        question = q
                        break
            
            # If still no question (all questions seen and none due), pick a random one
            if not question and all_questions:
                candidates = [q for q in all_questions if not engine.is_busy(q["prompt"], 15)]
                if candidates:
                    question = random.choice(candidates)
                else:
                    question = random.choice(all_questions)

            return jsonify({
                "jsonrpc": "2.0",
                "result": question,
                "id": req_id
            })
        

        if method == "provideAnswer":
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
                            # Map frontend score (0-100?) to FSRS score (0-3)
                            fsrs_score = score
                            if score > 3:
                                if score >= 90: fsrs_score = 3
                                elif score >= 75: fsrs_score = 2
                                elif score >= 50: fsrs_score = 1
                                else: fsrs_score = 0
                            
                            engine.record_answer(question_prompt, int(fsrs_score))
                            print(f"Recorded SRS answer for '{question_prompt}': {fsrs_score}")
                        except Exception as e:
                            print(f"Error recording SRS answer: {e}")

            return jsonify({
                "jsonrpc": "2.0",
                "result": "ok",
                "id": req_id
            })
        
        return jsonify({
            "jsonrpc": "2.0",
            "error": {"code": -32601, "message": "Method not found"},
            "id": req_id
        })
    except Exception as e:
        return jsonify({"jsonrpc": "2.0", "error": {"code": -32603, "message": "Internal error", "data": str(e)}, "id": None})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
