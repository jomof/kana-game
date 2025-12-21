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

import kotogram
from kotogram import SudachiJapaneseParser

app = Flask(__name__)

# Initialize kotogram parser (singleton for efficiency)
_kotogram_parser = None

def get_kotogram_parser():
    """Get the singleton kotogram parser instance."""
    global _kotogram_parser
    if _kotogram_parser is None:
        _kotogram_parser = SudachiJapaneseParser()
    return _kotogram_parser

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

# Grammar analysis cache: maps Japanese text to grammar analysis dict
GRAMMAR_CACHE = {}

def analyze_grammar(japanese_text):
    """
    Analyze the grammar of a Japanese sentence.
    Returns a dict with grammar analysis results.
    Results are cached for efficiency.
    
    Uses GrammarAnalysis.to_json() for serialization to ensure
    compatibility with TypeScript GrammarAnalysis.fromJson().
    """
    if japanese_text in GRAMMAR_CACHE:
        return GRAMMAR_CACHE[japanese_text]
    
    try:
        parser = get_kotogram_parser()
        kotogram_text = parser.japanese_to_kotogram(japanese_text)
        analysis = kotogram.grammar(kotogram_text)
        # Use to_json() for proper serialization compatible with TS fromJson()
        result = json.loads(analysis.to_json())
        GRAMMAR_CACHE[japanese_text] = result
        return result
    except Exception as e:
        print(f"Error analyzing grammar for '{japanese_text}': {e}")
        return None

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
                            for item in data:
                                prompt = item.get('prompt')
                                answers = item.get('answers', [])
                                if prompt and answers:
                                    cleaned_answers = [ans.replace('{', '').replace('}', '') for ans in answers]
                                    original_answers = set(cleaned_answers)
                                    cleaned_answers = kotogram.augment(cleaned_answers)
                                    augmented_answers = set(cleaned_answers)
                                    added = list(augmented_answers - original_answers)
                                    removed = list(original_answers - augmented_answers)
                                    if added or removed:
                                        print(f"AUGMENT: prompt='{prompt}' added={added} removed={removed}")
                                    # Run grammar analysis on each answer
                                    answer_grammar = {}
                                    for ans in cleaned_answers:
                                        grammar_result = analyze_grammar(ans)
                                        if grammar_result:
                                            answer_grammar[ans] = grammar_result
                                    item['answers'] = cleaned_answers
                                    item['answerGrammar'] = answer_grammar
                            questions.extend(data)
                        elif isinstance(data, dict) and 'examples' in data:
                            for ex in data['examples']:
                                prompt = ex.get('english')
                                japanese_answers = ex.get('japanese', [])
                                cleaned_answers = [ans.replace('{', '').replace('}', '') for ans in japanese_answers]
                                original_answers = set(cleaned_answers)
                                cleaned_answers = kotogram.augment(cleaned_answers)
                                augmented_answers = set(cleaned_answers)
                                added = list(augmented_answers - original_answers)
                                removed = list(original_answers - augmented_answers)
                                if added or removed:
                                    print(f"AUGMENT: prompt='{prompt}' added={added} removed={removed}")
                                if prompt and cleaned_answers:
                                    # Run grammar analysis on each answer
                                    answer_grammar = {}
                                    for ans in cleaned_answers:
                                        grammar_result = analyze_grammar(ans)
                                        if grammar_result:
                                            answer_grammar[ans] = grammar_result
                                    questions.append({
                                        "prompt": prompt,
                                        "answers": cleaned_answers,
                                        "answerGrammar": answer_grammar
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
                    # If no due questions, pick a random never-reviewed question
                    never_reviewed = [q for q in all_questions if not engine.has_card(q["prompt"])]
                    if never_reviewed:
                        question = random.choice(never_reviewed)
                        srs_log_msg = f"SRS: Selected random never-reviewed question '{question['prompt']}'"
                    else:
                        # All questions have been reviewed and none are due
                        # Just pick a random one and let FSRS handle the scheduling
                        question = random.choice(all_questions)
                        srs_log_msg = f"SRS: All questions reviewed, selected random question '{question['prompt']}'"
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
                            engine.bury_card(question_prompt, 15)
                            print(f"Buried card '{question_prompt}' for 15 minutes")
                        else:
                            # Pass score directly (0-100) to the SRS engine
                            engine.record_answer(question_prompt, int(score))
                            print(f"Recorded SRS answer for '{question_prompt}': {score}")

                response_data = {
                    "jsonrpc": "2.0",
                    "result": "ok",
                    "id": req_id
                }

            elif method == "log":
                level = params.get("level", "INFO")
                message = params.get("message", "")
                log_transaction(user, {"method": "log", "level": level}, {"message": message})
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
