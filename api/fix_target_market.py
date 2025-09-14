import sqlite3
import json

# Connect to the database
conn = sqlite3.connect('email_campaigns.db')
cursor = conn.cursor()

# Find campaigns where target_market contains long text (likely AI suggestions)
cursor.execute("""
    SELECT id, campaign_name, target_market, target_age_range, target_industry, target_company_size 
    FROM campaigns 
    WHERE LENGTH(target_market) > 100 OR target_market LIKE '%Below is a deep dive%'
""")

problematic_campaigns = cursor.fetchall()

print(f"Found {len(problematic_campaigns)} campaigns with corrupted target_market data:")

for campaign in problematic_campaigns:
    campaign_id, campaign_name, target_market, age_range, industry, company_size = campaign
    
    print(f"\nCampaign: {campaign_name} (ID: {campaign_id[:8]}...)")
    print(f"  Current target_market (first 100 chars): {str(target_market)[:100]}...")
    print(f"  Age Range: {age_range}")
    print(f"  Industry: {industry}")
    print(f"  Company Size: {company_size}")
    
    # Create a proper target_market from the other fields
    target_parts = []
    if age_range and age_range != 'Unknown':
        target_parts.append(f"Age: {age_range}")
    if industry and industry != 'Unknown':
        target_parts.append(f"Industry: {industry}")
    if company_size and company_size != 'Unknown':
        target_parts.append(f"Company: {company_size}")
    
    new_target_market = ", ".join(target_parts) if target_parts else None
    
    print(f"  Proposed new target_market: {new_target_market}")
    
    # Update the database
    cursor.execute("""
        UPDATE campaigns 
        SET target_market = ? 
        WHERE id = ?
    """, (new_target_market, campaign_id))
    
    print(f"  ✅ Updated target_market")

# Commit changes
conn.commit()
print(f"\n🎉 Fixed {len(problematic_campaigns)} campaigns")

# Verify the changes
print("\n" + "="*60)
print("Verification - checking all campaigns:")

cursor.execute("SELECT id, campaign_name, target_market, target_age_range, target_industry, target_company_size FROM campaigns")
all_campaigns = cursor.fetchall()

for campaign in all_campaigns:
    campaign_id, name, target_market, age_range, industry, company_size = campaign
    print(f"\n{name} (ID: {campaign_id[:8]}...)")
    print(f"  Target Market: {target_market}")
    print(f"  Age Range: {age_range}")
    print(f"  Industry: {industry}")
    print(f"  Company Size: {company_size}")

conn.close()