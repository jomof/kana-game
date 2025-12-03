from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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

        if method == "getQuestions":
            # In a real app, params might specify count, difficulty, etc.
            return jsonify({
                "jsonrpc": "2.0",
                "result": QUESTIONS,
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
