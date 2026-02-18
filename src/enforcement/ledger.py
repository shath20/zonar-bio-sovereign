"""Blue Ledger - Immutable Acoustic Credit Score tracking."""
import sqlite3
import os
from datetime import datetime
from src.config import DATA_DIR


class BlueLedger:
    """Tracks vessel Acoustic Credit Scores (ACS) in a SQLite ledger."""

    def __init__(self, db_name="blue_ledger.db"):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.db_path = os.path.join(DATA_DIR, db_name)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS vessels (
                    vessel_id TEXT PRIMARY KEY,
                    vessel_name TEXT NOT NULL,
                    acs INTEGER DEFAULT 100,
                    violation_count INTEGER DEFAULT 0,
                    last_violation TEXT,
                    risk_premium TEXT DEFAULT 'STANDARD'
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS violation_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    vessel_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    violation_type TEXT,
                    penalty INTEGER,
                    advisory_issued TEXT,
                    FOREIGN KEY (vessel_id) REFERENCES vessels(vessel_id)
                )
            """)

    def record_violation(self, vessel_id, vessel_name, violation_type,
                         penalty=15, advisory=""):
        """Records a violation and updates the vessel's ACS."""
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            # Upsert vessel
            row = conn.execute(
                "SELECT acs, violation_count FROM vessels WHERE vessel_id=?",
                (vessel_id,)
            ).fetchone()

            if row:
                new_acs = max(0, row[0] - penalty)
                new_count = row[1] + 1
                conn.execute("""
                    UPDATE vessels SET acs=?, violation_count=?,
                    last_violation=?, risk_premium=?
                    WHERE vessel_id=?
                """, (new_acs, new_count, now,
                      self._calc_risk(new_acs), vessel_id))
            else:
                new_acs = 100 - penalty
                conn.execute("""
                    INSERT INTO vessels
                    (vessel_id, vessel_name, acs, violation_count,
                     last_violation, risk_premium)
                    VALUES (?, ?, ?, 1, ?, ?)
                """, (vessel_id, vessel_name, new_acs, now,
                      self._calc_risk(new_acs)))

            # Log the violation
            conn.execute("""
                INSERT INTO violation_log
                (vessel_id, timestamp, violation_type, penalty, advisory_issued)
                VALUES (?, ?, ?, ?, ?)
            """, (vessel_id, now, violation_type, penalty, advisory))

        print(f"[LEDGER] {vessel_name} ACS: {new_acs} | "
              f"Risk: {self._calc_risk(new_acs)}")
        return new_acs

    def get_vessel(self, vessel_id):
        """Retrieves a vessel's current status."""
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                "SELECT * FROM vessels WHERE vessel_id=?", (vessel_id,)
            ).fetchone()
        if row:
            return {
                "vessel_id": row[0], "name": row[1], "acs": row[2],
                "violations": row[3], "last_violation": row[4],
                "risk_premium": row[5]
            }
        return None

    @staticmethod
    def _calc_risk(acs):
        """Calculates risk premium tier based on ACS."""
        if acs >= 80:
            return "STANDARD"
        elif acs >= 50:
            return "ELEVATED"
        elif acs >= 25:
            return "HIGH"
        return "CRITICAL"
