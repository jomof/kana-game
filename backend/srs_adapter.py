"""
Adapter layer for srsdb to match the interface previously used by srs_engine.py

This provides a compatibility layer so that existing code using FsrsSQLiteScheduler
can use srsdb.FsrsDatabase with minimal changes.
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

from srsdb import FsrsDatabase


def utc_now() -> datetime:
    """Return the current time in UTC."""
    return datetime.now(timezone.utc)


class FsrsSQLiteScheduler:
    """
    Adapter wrapping srsdb.FsrsDatabase to match the previous srs_engine interface.

    This maintains API compatibility with the old FsrsSQLiteScheduler while
    delegating to srsdb for the actual SRS logic.

    Usage:
        engine = FsrsSQLiteScheduler.for_user("alice", Path("./data"))
        key = engine.get_next_question()
        if key is not None:
            engine.record_answer(key, score=2)  # 0..3
    """

    def __init__(self, db_path: Path) -> None:
        """
        Initialize the scheduler with a database path.

        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        # Lazy initialization - create the database connection only when needed
        self._db = None

    def _get_db(self) -> FsrsDatabase:
        """Get or create the database instance."""
        if self._db is None:
            self._db = FsrsDatabase(str(self.db_path))
        return self._db

    @classmethod
    def for_user(cls, user_id: str, base_dir: Path) -> "FsrsSQLiteScheduler":
        """
        Convenience constructor that picks <base_dir>/<user_id>.db as the DB path.

        Args:
            user_id: User identifier
            base_dir: Base directory for user databases

        Returns:
            FsrsSQLiteScheduler instance
        """
        base_dir.mkdir(parents=True, exist_ok=True)
        db_path = base_dir / f"{user_id}.db"
        return cls(db_path)

    def close(self) -> None:
        """
        Close the underlying database connection.
        """
        # srsdb handles connection management internally
        pass

    def has_card(self, key: str) -> bool:
        """
        Check if a card with the given key exists in the database.

        Args:
            key: Question key to check

        Returns:
            True if the card exists, False otherwise
        """
        # Check if the card has been reviewed by trying to get next cards
        # This is a simple implementation - srsdb will create cards on first answer
        # We can check if there's any review history by seeing if next() ever returns it
        # For now, we'll use a database query approach
        import sqlite3
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM fsrs_cards WHERE question_key = ? LIMIT 1", (key,))
        exists = cursor.fetchone() is not None
        conn.close()
        return exists

    def get_next_question(self) -> Optional[str]:
        """
        Return the key of the next due question, or None if no question is due.

        Returns:
            Question key or None
        """
        now = utc_now()
        due_cards = self._get_db().next(now)
        if due_cards:
            return due_cards[0]  # Return the first due card
        return None

    def bury_card(self, key: str, minutes: int = 15) -> None:
        """
        Delay the card for a specified number of minutes.

        This is implemented by recording a "skip" answer with a neutral score.
        srsdb doesn't have a native "bury" concept, so we simulate it by
        recording a medium-correctness answer which will schedule it for later.

        Args:
            key: Question key to bury
            minutes: Number of minutes to delay (currently ignored, uses srsdb scheduling)
        """
        now = utc_now()
        # Record a neutral score (50) to push the card back without marking it wrong
        self._get_db().answer(now, key, correct=50)

    def is_busy(self, key: str, minutes: int = 15) -> bool:
        """
        Check if the card was updated within the last `minutes`.

        Args:
            key: Question key to check
            minutes: Time window in minutes

        Returns:
            True if the card was recently updated
        """
        import sqlite3
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Check the most recent review time from the fsrs_reviews table
        cursor.execute(
            """
            SELECT MAX(review_time) as last_review
            FROM fsrs_reviews
            WHERE question_key = ?
            """,
            (key,)
        )
        result = cursor.fetchone()
        conn.close()

        if result is None or result[0] is None:
            return False

        last_review_str = result[0]
        # Parse the datetime string
        try:
            last_review = datetime.fromisoformat(last_review_str.replace('Z', '+00:00'))
            if last_review.tzinfo is None:
                last_review = last_review.replace(tzinfo=timezone.utc)

            cutoff = utc_now() - timedelta(minutes=minutes)
            return last_review > cutoff
        except (ValueError, AttributeError):
            return False

    def record_answer(self, key: str, score: int) -> None:
        """
        Update SRS state for the given question key based on a 0-3 score.

        score mapping (0-3 to 0-100):
            0 (Again) -> 0
            1 (Hard)  -> 40
            2 (Good)  -> 70
            3 (Easy)  -> 100

        Args:
            key: Question key
            score: Score from 0-3
        """
        if score not in [0, 1, 2, 3]:
            raise ValueError(f"Invalid score {score}, expected 0..3")

        # Map 0-3 scores to 0-100 percentile scores for srsdb
        score_map = {
            0: 0,    # Again
            1: 40,   # Hard
            2: 70,   # Good
            3: 100,  # Easy
        }

        correctness = score_map[score]
        now = utc_now()
        self._get_db().answer(now, key, correct=correctness)
