"""Blue Ledger - Immutable Acoustic Credit Score tracking."""
import sqlite3
import os
from datetime import datetime
from src.config import DATA_DIR

FREEZE_THRESHOLD = 15  # ACS at or below this = license frozen


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
                    risk_premium TEXT DEFAULT 'STANDARD',
                    license_frozen INTEGER DEFAULT 0
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
            # Migration: add license_frozen column if missing
            try:
                conn.execute(
                    "ALTER TABLE vessels ADD COLUMN license_frozen "
                    "INTEGER DEFAULT 0"
                )
            except sqlite3.OperationalError:
                pass  # Column already exists

    def record_violation(self, vessel_id, vessel_name, violation_type,
                         penalty=15, advisory=""):
        """Records a violation and updates the vessel's ACS."""
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                "SELECT acs, violation_count FROM vessels WHERE vessel_id=?",
                (vessel_id,)
            ).fetchone()

            if row:
                new_acs = max(0, row[0] - penalty)
                new_count = row[1] + 1
                frozen = 1 if new_acs <= FREEZE_THRESHOLD else 0
                conn.execute("""
                    UPDATE vessels SET acs=?, violation_count=?,
                    last_violation=?, risk_premium=?, license_frozen=?
                    WHERE vessel_id=?
                """, (new_acs, new_count, now,
                      self._calc_risk(new_acs), frozen, vessel_id))
            else:
                new_acs = 100 - penalty
                frozen = 1 if new_acs <= FREEZE_THRESHOLD else 0
                conn.execute("""
                    INSERT INTO vessels
                    (vessel_id, vessel_name, acs, violation_count,
                     last_violation, risk_premium, license_frozen)
                    VALUES (?, ?, ?, 1, ?, ?, ?)
                """, (vessel_id, vessel_name, new_acs, now,
                      self._calc_risk(new_acs), frozen))

            # Log the violation
            conn.execute("""
                INSERT INTO violation_log
                (vessel_id, timestamp, violation_type, penalty, advisory_issued)
                VALUES (?, ?, ?, ?, ?)
            """, (vessel_id, now, violation_type, penalty, advisory))

        risk = self._calc_risk(new_acs)
        freeze_msg = " ⛔ LICENSE FROZEN!" if frozen else ""
        print(f"[LEDGER] {vessel_name} ACS: {new_acs} | "
              f"Risk: {risk}{freeze_msg}")
        return new_acs

    def get_vessel(self, vessel_id):
        """Retrieves a vessel's current status."""
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                "SELECT * FROM vessels WHERE vessel_id=?", (vessel_id,)
            ).fetchone()
        if row:
            acs = row[2]
            return {
                "vessel_id": row[0], "name": row[1], "acs": acs,
                "violations": row[3], "last_violation": row[4],
                "risk_premium": row[5],
                "license_frozen": bool(row[6]) if len(row) > 6 else False,
                "points_to_freeze": max(0, acs - FREEZE_THRESHOLD)
            }
        return None

    def get_all_vessels(self):
        """Retrieves all vessels from the ledger."""
        with sqlite3.connect(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM vessels ORDER BY acs ASC"
            ).fetchall()
        results = []
        for r in rows:
            acs = r[2]
            results.append({
                "vessel_id": r[0], "name": r[1], "acs": acs,
                "violations": r[3], "last_violation": r[4],
                "risk_premium": r[5],
                "license_frozen": bool(r[6]) if len(r) > 6 else False,
                "points_to_freeze": max(0, acs - FREEZE_THRESHOLD)
            })
        return results

    def clear_ledger(self):
        """Clears all vessel and violation records."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM violation_log")
            conn.execute("DELETE FROM vessels")
        print("[LEDGER] All records cleared.")

    @staticmethod
    def _calc_risk(acs):
        """Calculates risk premium tier based on ACS."""
        if acs <= FREEZE_THRESHOLD:
            return "FROZEN"
        elif acs >= 80:
            return "STANDARD"
        elif acs >= 50:
            return "ELEVATED"
        elif acs >= 25:
            return "HIGH"
        return "CRITICAL"
