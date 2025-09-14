"""
Database migration script to add target market columns to existing campaigns table.
This script safely adds the new columns without losing existing data.
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add target market columns to existing campaigns table"""
    
    # Database file path
    db_path = Path(__file__).parent / "email_campaigns.db"
    
    if not db_path.exists():
        print("No existing database found. New database will be created with all columns.")
        return
    
    print(f"Migrating database: {db_path}")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if the new columns already exist
        cursor.execute("PRAGMA table_info(campaigns)")
        columns = [column[1] for column in cursor.fetchall()]
        
        new_columns = ['target_market', 'target_age_range', 'target_industry', 'target_company_size']
        columns_to_add = [col for col in new_columns if col not in columns]
        
        if not columns_to_add:
            print("✅ Database already has all required columns. No migration needed.")
            return
        
        print(f"Adding columns: {columns_to_add}")
        
        # Add missing columns one by one
        for column in columns_to_add:
            alter_sql = f"ALTER TABLE campaigns ADD COLUMN {column} TEXT"
            cursor.execute(alter_sql)
            print(f"✅ Added column: {column}")
        
        # Commit changes
        conn.commit()
        print("✅ Database migration completed successfully!")
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(campaigns)")
        final_columns = [column[1] for column in cursor.fetchall()]
        print(f"Final table columns: {final_columns}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()