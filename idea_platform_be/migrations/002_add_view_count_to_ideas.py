"""
Migration script to add view_count column to ideas table
Run this script to update your existing database schema
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_add_view_count():
    """Add view_count column to ideas table"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            # For MySQL
            print("Adding view_count column to ideas table...")
            db.session.execute(text(
                "ALTER TABLE ideas ADD COLUMN view_count INT DEFAULT 0 NOT NULL;"
            ))
            db.session.commit()
            print("✓ Migration successful! view_count column added to ideas table.")
            print("✓ View tracking is now enabled for ideas.")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            print("\nNote: If the column already exists, this error can be ignored.")

if __name__ == '__main__':
    migrate_add_view_count()
