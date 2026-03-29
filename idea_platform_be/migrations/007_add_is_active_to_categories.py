"""
Migration: Add is_active column to categories table
Allows categories to be enabled/disabled dynamically
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_add_is_active_to_categories():
    """Add is_active column to categories table"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Adding is_active column to categories table...")
            db.session.execute(text("""
                ALTER TABLE categories 
                ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE
                AFTER description;
            """))
            print("✓ Added is_active column to categories")
            
            # Add index for better query performance
            print("Adding index for is_active column...")
            db.session.execute(text("CREATE INDEX idx_categories_is_active ON categories(is_active);"))
            print("✓ Added index on is_active column")
            
            db.session.commit()
            print("\n Migration 007 completed successfully!")
            print("   - Added is_active column (BOOLEAN) to categories table")
            print("   - Set default value to TRUE")
            print("   - Added index for performance")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n Migration 007 failed: {str(e)}")
            raise

def rollback_add_is_active_to_categories():
    """Rollback: Remove is_active column from categories table"""
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Removing is_active column from categories table...")
            db.session.execute(text("DROP INDEX idx_categories_is_active ON categories;"))
            db.session.execute(text("ALTER TABLE categories DROP COLUMN is_active;"))
            db.session.commit()
            print("✓ Rolled back migration 007")
            
        except Exception as e:
            db.session.rollback()
            print(f" Rollback failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate_add_is_active_to_categories()
