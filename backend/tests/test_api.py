import unittest
import json
import tempfile
import shutil
from pathlib import Path
from app import app, DATA_DIR, ENGINES, get_engine

class TestApi(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        # Mock DATA_DIR in app (this is tricky because it's a global variable)
        # Instead, I'll rely on the fact that get_engine uses DATA_DIR.
        # But I can't easily change DATA_DIR.
        # However, I can use a unique user ID to get a fresh DB.
        self.user = "test_user_bug"
        self.client = app.test_client()
        
        # Ensure we have questions loaded
        # We can use the real questions since we are using a separate DB for the user
        
    def tearDown(self):
        # Clean up the user's DB
        engine = ENGINES.get(self.user)
        if engine:
            engine.close()
            del ENGINES[self.user]
        
        db_path = DATA_DIR / f"{self.user}.db"
        if db_path.exists():
            db_path.unlink()
        shutil.rmtree(self.test_dir)

    def test_provide_answer_with_null_score_buries_card(self):
        # 1. Get a question
        res = self.client.post('/api', json={
            "jsonrpc": "2.0",
            "method": "getNextQuestion",
            "params": {"user": self.user},
            "id": 1
        })
        data = res.get_json()
        question = data['result']
        prompt = question['prompt']
        
        # 2. Provide answer with score=None (simulating missing score)
        res = self.client.post('/api', json={
            "jsonrpc": "2.0",
            "method": "provideAnswer",
            "params": {
                "user": self.user,
                "question": prompt,
                "score": None
            },
            "id": 2
        })
        
        # 3. Check if the card is busy
        engine = get_engine(self.user)
        is_busy = engine.is_busy(prompt)
        
        # Current behavior: It should NOT be busy because score=None is ignored
        self.assertTrue(is_busy, "Card SHOULD be busy if score is None (fix required)")

if __name__ == '__main__':
    unittest.main()
