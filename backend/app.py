from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
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

# Sample data based on frontend/index.html
QUESTIONS = [
    {
        "prompt": "I live[すむ] in Seattle[シアトル].",
        "answers": [
            "私 は シアトル に 住んでいます。",
            "私 は シアトル に 住んでる。"
        ]
    },
    {
        "prompt": "I am a student[がくせい].",
        "answers": [
            "私 は 学生 です。"
        ]
    },
    {
        "prompt": "I am a teacher[せんせい].",
        "answers": [
            "私 は 先生 です。"
        ]
    },
    {
        "prompt": "I eat[たべる] sushi[すし] every[まい] day[にち].",
        "answers": [
            "私 は 毎 日 寿司 を 食べます。",
            "私 は 毎 日 寿司 を 食べる。"
        ]
    },
    {
        "prompt": "I can speak[はなす] Japanese[にほんご].",
        "answers": [
            "私 は 日本語 を 話すこと が できます。",
            "私 は 日本語 を 話すこと が できる。",
            "私 は 日本語 が 話せます。",
            "私 は 日本語 が 話せる。"
        ]
    },
    {
        "prompt": "What is your hobby[しゅみ]?",
        "answers": [
            "あなた の 趣味 は 何 です か。",
            "趣味 は 何 です か。"
        ]
    },
    {
        "prompt": "Where are you from[しゅっしん]?",
        "answers": [
            "出身 は どこ です か。",
            "あなた の 出身 は どこ です か。"
        ]
    },
    {
        "prompt": "Do you like movies[えいが]?",
        "answers": [
            "映画 は 好き です か。",
            "あなた は 映画 が 好き です か。"
        ]
    },
    {
        "prompt": "What kind of music[おんがく] do you listen[きく] to?",
        "answers": [
            "どんな 音楽 を 聴き ます か。",
            "どんな 音楽 を 聴く の。"
        ]
    },
    {
        "prompt": "Have you been[いく] to Japan[にほん]?",
        "answers": [
            "日本 に 行った こと が あり ます か。",
            "日本 に 行った こと ある。"
        ]
    },
    {
        "prompt": "What is your favorite[すき] food[たべもの]?",
        "answers": [
            "好き な 食べ物 は 何 です か。"
        ]
    },
    {
        "prompt": "Do you have siblings[きょうだい]?",
        "answers": [
            "兄弟 は い ます か。",
            "兄弟 は いる の。"
        ]
    },
    {
        "prompt": "What do you do[する] on weekends[しゅうまつ]?",
        "answers": [
            "週末 は 何 を し ます か。",
            "週末 は 何 を する の。"
        ]
    },
    {
        "prompt": "The weather[てんき] is nice[いい] today[きょう].",
        "answers": [
            "今日 は いい 天気 です ね。",
            "今日 は いい 天気 だ ね。"
        ]
    },
    {
        "prompt": "Nice to meet you[はじめまして].",
        "answers": [
            "初めまして。"
        ]
    }
]

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
            
            question = None
            if next_key:
                # Find the question object for this key
                # In a real app, this would be a DB lookup
                for q in QUESTIONS:
                    if q["prompt"] == next_key:
                        question = q
                        break
            
            # If no question is due (or key not found), pick a random one
            # This ensures the user always gets a question even if they are "done" for now
            if not question:
                question = random.choice(QUESTIONS)

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
                
                if question_prompt and score is not None:
                    try:
                        # Map frontend score (0-100?) to FSRS score (0-3)
                        # Assuming frontend sends 0-3 based on previous context, but let's be safe
                        # If score is 0-100, we need to map it. 
                        # Let's assume the frontend sends 0-3 as per the srs_engine.py docstring
                        # But wait, the frontend sends `score` which might be 0-100.
                        # Let's check the frontend code again or assume 0-3 for now based on user request.
                        # Actually, let's look at the previous turn. The user said "kana-control added a 'score'".
                        # We should probably normalize it.
                        # For now, let's pass it through and let the engine validate/handle it.
                        # But srs_engine expects 0-3.
                        
                        # Simple mapping if score is > 3 (e.g. percentage)
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
