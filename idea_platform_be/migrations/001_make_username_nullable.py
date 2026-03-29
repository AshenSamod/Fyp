"""
Migration script to make username nullable
Run this script to update your existing database schema
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_username_nullable():
    """Make username column nullable in users table"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            # For MySQL
            print("Making username nullable in users table...")
            db.session.execute(text(
                "ALTER TABLE users MODIFY COLUMN username VARCHAR(80) NULL;"
            ))
            db.session.commit()
            print("✓ Migration successful! Username is now nullable.")
            print("✓ Users can now login with email or username.")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            print("\nIf you're starting fresh, you can drop and recreate the database:")
            print("  1. DROP DATABASE idea_platform;")
            print("  2. CREATE DATABASE idea_platform;")
            print("  3. Run: python init_db.py")

if __name__ == '__main__':
    migrate_username_nullable()
