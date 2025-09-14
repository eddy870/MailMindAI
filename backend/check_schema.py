import sqlite3

# Connect to the database
conn = sqlite3.connect('email_campaigns.db')
cursor = conn.cursor()

# Get table schema
cursor.execute("PRAGMA table_info(campaigns)")
columns = cursor.fetchall()

print("Database schema for 'campaigns' table:")
print("Index | Name | Type | NotNull | Default | Primary Key")
print("-" * 60)
for i, (cid, name, type_, notnull, default, pk) in enumerate(columns):
    print(f"{i:5} | {name:20} | {type_:10} | {notnull:7} | {str(default):7} | {pk}")

print("\n" + "="*60)

# Let's also check what was actually inserted
cursor.execute("SELECT id, campaign_name, target_market, target_age_range, target_industry, target_company_size, analyzed_at FROM campaigns LIMIT 2")
rows = cursor.fetchall()

print("\nActual data in target market fields:")
for row in rows:
    print(f"ID: {row[0][:8]}...")
    print(f"  Campaign: {row[1]}")
    print(f"  Target Market: {row[2]}")
    print(f"  Age Range: {row[3]}")
    print(f"  Industry: {row[4]}")
    print(f"  Company Size: {row[5]}")
    print(f"  Analyzed At: {row[6]}")
    print("-" * 40)

conn.close()