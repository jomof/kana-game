import unittest
import tempfile
import shutil
from pathlib import Path
from srs_adapter import FsrsSQLiteScheduler

class TestFsrsSQLiteScheduler(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = Path(self.test_dir) / "test.db"
        self.engine = FsrsSQLiteScheduler(self.db_path)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_bury_card_defers_for_15_minutes(self):
        key = "test_question"

        # Bury the card (this will create it if it doesn't exist)
        self.engine.bury_card(key, minutes=15)

        # Verify that get_next_question does not return this card immediately
        next_q = self.engine.get_next_question()
        # If this was the only card, it should return None since it's been buried
        self.assertIsNone(next_q)

        # Verify the card now exists in the database
        self.assertTrue(self.engine.has_card(key))

if __name__ == '__main__':
    unittest.main()
