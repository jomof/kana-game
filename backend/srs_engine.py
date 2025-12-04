# fsrs_engine.py

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fsrs import Scheduler, Card, Rating, ReviewLog

# Mapping from your 0-3 scores to FSRS ratings (1-4)
RATING_MAP = {
    0: Rating.Again,
    1: Rating.Hard,
    2: Rating.Good,
    3: Rating.Easy,
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class FsrsConfig:
    """
    Configuration for the FSRS engine.

    Currently just holds the DB path, but can be extended later
    with options for desired_retention, learning_steps, etc.
    """
    db_path: Path


class FsrsSQLiteScheduler:
    """
    FSRS-backed spaced-repetition engine using a per-user SQLite database.

    Responsibilities:
      - Manage SQLite schema for cards, review logs, and scheduler parameters.
      - Store FSRS Card and ReviewLog objects as JSON in the database.
      - Provide two main public operations:
          * get_next_question() -> Optional[str]
              Choose the next due question key for this user.
          * record_answer(key: str, score: int) -> None
              Update FSRS state given a 0-3 score (Again/Hard/Good/Easy).

    Usage:
        engine = FsrsSQLiteScheduler.for_user("alice", Path("./data"))
        key = engine.get_next_question()
        if key is not None:
            # ask the user this question somehow
            ...
            engine.record_answer(key, score=2)  # 0..3

    The scheduler parameters can be optimized using optimize_scheduler()
    once enough review logs have accumulated.
    """

    def __init__(self, config: FsrsConfig) -> None:
        self.config = config
        self._conn = sqlite3.connect(config.db_path)
        self._conn.row_factory = sqlite3.Row
        self._ensure_schema()
        self._scheduler = self._load_or_init_scheduler()

    # ---------- construction helpers ----------

    @classmethod
    def for_user(cls, user_id: str, base_dir: Path) -> "FsrsSQLiteScheduler":
        """
        Convenience constructor that picks <base_dir>/<user_id>.db as the DB path.
        """
        base_dir.mkdir(parents=True, exist_ok=True)
        db_path = base_dir / f"{user_id}.db"
        return cls(FsrsConfig(db_path=db_path))

    def close(self) -> None:
        """
        Close the underlying SQLite connection.
        """
        if self._conn:
            self._conn.close()

    # ---------- schema initialization ----------

    def _ensure_schema(self) -> None:
        c = self._conn.cursor()

        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS scheduler (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                scheduler_json TEXT NOT NULL,
                last_optimized_at_utc TEXT
            );

            CREATE TABLE IF NOT EXISTS cards (
                key TEXT PRIMARY KEY,
                card_json TEXT NOT NULL,
                due_utc TEXT NOT NULL,
                created_at_utc TEXT NOT NULL,
                updated_at_utc TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1
            );

            CREATE INDEX IF NOT EXISTS idx_cards_active_due
                ON cards (active, due_utc);

            CREATE TABLE IF NOT EXISTS review_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                review_json TEXT NOT NULL,
                rating INTEGER NOT NULL,
                review_datetime_utc TEXT NOT NULL,
                FOREIGN KEY (key) REFERENCES cards(key) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_review_logs_key
                ON review_logs (key);
            """
        )
        self._conn.commit()

    # ---------- scheduler persistence ----------

    def _load_or_init_scheduler(self) -> Scheduler:
        c = self._conn.cursor()
        row = c.execute("SELECT scheduler_json FROM scheduler WHERE id = 1").fetchone()
        if row is None:
            # initialize with FSRS defaults
            scheduler = Scheduler()
            c.execute(
                "INSERT INTO scheduler (id, scheduler_json, last_optimized_at_utc) "
                "VALUES (1, ?, ?)",
                (scheduler.to_json(), None),
            )
            self._conn.commit()
            return scheduler

        return Scheduler.from_json(row["scheduler_json"])

    def _save_scheduler(self) -> None:
        c = self._conn.cursor()
        c.execute(
            "UPDATE scheduler SET scheduler_json = ?, last_optimized_at_utc = ? "
            "WHERE id = 1",
            (self._scheduler.to_json(), utc_now().isoformat()),
        )
        self._conn.commit()

    # ---------- card helpers ----------

    def _load_card(self, key: str) -> Optional[Card]:
        c = self._conn.cursor()
        row = c.execute(
            "SELECT card_json FROM cards WHERE key = ? AND active = 1",
            (key,),
        ).fetchone()
        if row is None:
            return None
        return Card.from_json(row["card_json"])

    def _insert_card(self, key: str, card: Card) -> None:
        now = utc_now().isoformat()
        c = self._conn.cursor()
        c.execute(
            """
            INSERT INTO cards (key, card_json, due_utc, created_at_utc, updated_at_utc, active)
            VALUES (?, ?, ?, ?, ?, 1)
            """,
            (key, card.to_json(), card.due.isoformat(), now, now),
        )
        self._conn.commit()

    def _update_card(self, key: str, card: Card) -> None:
        now = utc_now().isoformat()
        c = self._conn.cursor()
        c.execute(
            """
            UPDATE cards
            SET card_json = ?, due_utc = ?, updated_at_utc = ?
            WHERE key = ?
            """,
            (card.to_json(), card.due.isoformat(), now, key),
        )
        self._conn.commit()

    def _ensure_card(self, key: str) -> Card:
        card = self._load_card(key)
        if card is not None:
            return card
        card = Card()  # new card, due immediately
        self._insert_card(key, card)
        return card

    # ---------- public API ----------

    def get_next_question(self) -> Optional[str]:
        """
        Return the key of the next due question, or None if no question is due.

        Selection strategy:
          - Only considers active cards.
          - Picks the card with the earliest due_utc <= now (UTC).
        """
        now_iso = utc_now().isoformat()
        c = self._conn.cursor()
        row = c.execute(
            """
            SELECT key
            FROM cards
            WHERE active = 1 AND due_utc <= ?
            ORDER BY due_utc ASC
            LIMIT 1
            """,
            (now_iso,),
        ).fetchone()
        if row is None:
            return None
        return row["key"]

    def record_answer(self, key: str, score: int) -> None:
        """
        Update FSRS state for the given question key based on a 0-3 score.

        score mapping:
            0 -> Again
            1 -> Hard
            2 -> Good
            3 -> Easy
        """
        if score not in RATING_MAP:
            raise ValueError(f"Invalid score {score}, expected 0..3")

        rating = RATING_MAP[score]
        card = self._ensure_card(key)

        card, review_log = self._scheduler.review_card(card, rating)

        # persist card
        self._update_card(key, card)

        # persist review log
        c = self._conn.cursor()
        c.execute(
            """
            INSERT INTO review_logs (key, review_json, rating, review_datetime_utc)
            VALUES (?, ?, ?, ?)
            """,
            (
                key,
                review_log.to_json(),
                int(review_log.rating),
                review_log.review_datetime.isoformat(),
            ),
        )
        self._conn.commit()

        # optionally: you could auto-optimize after N reviews, but that's
        # better done via an explicit optimize_scheduler() call.

    # ---------- optimizer ----------

    def optimize_scheduler(self) -> None:
        """
        Recompute FSRS parameters using the accumulated review logs.

        This is potentially expensive; call it occasionally (e.g. once a month)
        after enough review history has accumulated.
        """
        from fsrs import Optimizer  # imported lazily so tests can stub if needed

        c = self._conn.cursor()
        rows = c.execute("SELECT review_json FROM review_logs").fetchall()

        if not rows:
            # nothing to optimize yet
            return

        review_logs = [ReviewLog.from_json(r["review_json"]) for r in rows]

        optimizer = Optimizer(review_logs)
        optimal_parameters = optimizer.compute_optimal_parameters()

        # Keep other scheduler settings (desired_retention, etc.)
        self._scheduler = Scheduler(
            parameters=optimal_parameters,
            desired_retention=self._scheduler.desired_retention,
            learning_steps=self._scheduler.learning_steps,
            relearning_steps=self._scheduler.relearning_steps,
            maximum_interval=self._scheduler.maximum_interval,
            enable_fuzzing=self._scheduler.enable_fuzzing,
        )
        self._save_scheduler()
