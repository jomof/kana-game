import unittest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timedelta, timezone
from srs_engine import FsrsSQLiteScheduler, FsrsConfig, utc_now

class TestFsrsSQLiteScheduler(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = Path(self.test_dir) / "test.db"
        self.config = FsrsConfig(db_path=self.db_path)
        self.engine = FsrsSQLiteScheduler(self.config)

    def tearDown(self):
        self.engine.close()
        shutil.rmtree(self.test_dir)

    def test_bury_card_defers_for_15_minutes(self):
        key = "test_question"
        
        # Ensure card exists and get initial state
        self.engine._ensure_card(key)
        
        # Capture time before bury
        before_bury = utc_now()
        
        # Bury the card
        self.engine.bury_card(key, minutes=15)
        
        # Get the card again to check due date
        card = self.engine._load_card(key)
        
        # Expected due time is roughly now + 15 minutes
        # We allow a small delta for execution time
        expected_due_min = before_bury + timedelta(minutes=15)
        expected_due_max = utc_now() + timedelta(minutes=15)
        
        # Check if due date is within reasonable range
        # Note: card.due is timezone aware (UTC)
        self.assertGreaterEqual(card.due, expected_due_min)
        self.assertLessEqual(card.due, expected_due_max + timedelta(seconds=1))
        
        # Also verify that get_next_question does not return this card immediately
        next_q = self.engine.get_next_question()
        # If this was the only card, it should return None
        self.assertIsNone(next_q)

if __name__ == '__main__':
    unittest.main()
