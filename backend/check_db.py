import sqlite3
import json

# Connect to the database
conn = sqlite3.connect('email_campaigns.db')
cursor = conn.cursor()

# Get all campaigns
cursor.execute("SELECT * FROM campaigns")
campaigns = cursor.fetchall()

# Get column names
cursor.execute("PRAGMA table_info(campaigns)")
columns = [column[1] for column in cursor.fetchall()]

print("Column names:", columns)
print("\n" + "="*80)

for campaign in campaigns:
    print(f"\nCampaign ID: {campaign[0]}")
    print(f"Campaign Name: {campaign[1]}")
    
    # Find the target_market column (should be index 9 based on our schema)
    if len(campaign) > 9:
        target_market = campaign[9]
        print(f"Target Market (length {len(str(target_market)) if target_market else 0}): {str(target_market)[:100]}{'...' if target_market and len(str(target_market)) > 100 else ''}")
    
    # Show AI suggestions
    if len(campaign) > 7:
        ai_suggestions = campaign[7]
        try:
            ai_parsed = json.loads(ai_suggestions) if ai_suggestions else []
            print(f"AI Suggestions (type: {type(ai_parsed)}): {str(ai_parsed)[:100]}{'...' if len(str(ai_parsed)) > 100 else ''}")
        except:
            print(f"AI Suggestions (raw): {str(ai_suggestions)[:100]}{'...' if ai_suggestions and len(str(ai_suggestions)) > 100 else ''}")
    
    print("-" * 40)

conn.close()