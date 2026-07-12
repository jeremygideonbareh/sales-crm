import sqlite3

DB = r"C:\Users\cloud\OneDrive\Desktop\Hybrid_Second_Brain\agency dashboard\backend\sales_dashboard.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute("SELECT id, full_name FROM users WHERE role = 'REP' ORDER BY id")
reps = cur.fetchall()
print(f"Reps: {reps}")

cur.execute(
    "SELECT DISTINCT category FROM leads WHERE category IS NOT NULL AND category != '' ORDER BY category"
)
categories = [c[0] for c in cur.fetchall()]
print(f"Categories: {len(categories)}")

assignments = {r[0]: [] for r in reps}

for cat in categories:
    cur.execute(
        "SELECT id FROM leads WHERE category = ? AND assigned_to IS NULL ORDER BY id",
        (cat,),
    )
    lead_ids = [r[0] for r in cur.fetchall()]
    if not lead_ids:
        continue
    base = len(lead_ids) // len(reps)
    rem = len(lead_ids) % len(reps)
    idx = 0
    for i, rep in enumerate(reps):
        count = base + (1 if i < rem else 0)
        chunk = lead_ids[idx : idx + count]
        idx += count
        for lid in chunk:
            cur.execute(
                "UPDATE leads SET assigned_to = ?, status = 'uncalled' WHERE id = ?",
                (rep[0], lid),
            )
            assignments[rep[0]].append(lid)

conn.commit()

total = 0
for rid, lids in assignments.items():
    name = next(r[1] for r in reps if r[0] == rid)
    print(f"  {name}: {len(lids)} leads")
    total += len(lids)

print(f"Total assigned: {total}")

cur.execute("SELECT COUNT(*) FROM leads WHERE assigned_to IS NULL")
print(f"Unassigned: {cur.fetchone()[0]}")

cur.execute("SELECT category, COUNT(*) FROM leads GROUP BY category ORDER BY category")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

conn.close()
