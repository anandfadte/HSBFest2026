import os
import shutil
import sqlite3
from pathlib import Path

# Database file location: use /tmp on Vercel/serverless where root is read-only
BASE_DIR = Path(__file__).resolve().parent.parent

if os.environ.get("VERCEL"):
    DB_PATH = Path("/tmp/fest.db")
    # If /tmp/fest.db does not exist yet in this serverless instance, copy pre-seeded fest.db
    if not DB_PATH.exists():
        source_db = BASE_DIR / "fest.db"
        if source_db.exists():
            try:
                shutil.copyfile(source_db, DB_PATH)
            except Exception:
                pass
else:
    DB_PATH = BASE_DIR / "fest.db"



def get_db_connection() -> sqlite3.Connection:
    """Connect to the SQLite database and configure row factory and pragmas."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create the events and registrations tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            event_date TEXT NOT NULL,
            event_time TEXT NOT NULL,
            venue TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            fee INTEGER NOT NULL DEFAULT 0,
            icon TEXT
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL REFERENCES events(id),
            student_name TEXT NOT NULL,
            roll_number TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            registered_at TEXT NOT NULL,
            UNIQUE(event_id, email)
        )
        """
    )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
