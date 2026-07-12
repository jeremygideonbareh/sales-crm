"""Export SQLite leads data to JSON for seeding production DB."""
import json
import sqlite3

DB = "sales_dashboard.db"

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row

user_map = {u["id"]: u["email"] for u in [dict(r) for r in conn.execute("SELECT * FROM users")]}
leads = [dict(r) for r in conn.execute("SELECT * FROM leads")]

for l in leads:
    l.pop("id", None)
    l.pop("closed_by", None)
    if l.get("assigned_to") and l["assigned_to"] in user_map:
        l["assigned_to_email"] = user_map[l["assigned_to"]]
    l.pop("assigned_to", None)

with open("seed_data.json", "w", encoding="utf-8") as f:
    json.dump({"leads": leads}, f, ensure_ascii=False, default=str)

print(f"Exported {len(leads)} leads")
