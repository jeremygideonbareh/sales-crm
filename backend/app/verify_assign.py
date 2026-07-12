import sqlite3

DB = r"C:\Users\cloud\OneDrive\Desktop\Hybrid_Second_Brain\agency dashboard\backend\sales_dashboard.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute(
    "SELECT u.full_name, COUNT(l.id) FROM users u LEFT JOIN leads l ON l.assigned_to = u.id WHERE u.role = 'REP' GROUP BY u.id"
)
for r in cur.fetchall():
    print(f"{r[0]}: {r[1]} leads")

cur.execute("SELECT COUNT(*) FROM leads WHERE assigned_to IS NULL")
print(f"Unassigned: {cur.fetchone()[0]}")

cur.execute("SELECT category, COUNT(*) FROM leads GROUP BY category ORDER BY category")
for r in cur.fetchall():
    print(f"  {r[0]}: {r[1]}")

conn.close()
