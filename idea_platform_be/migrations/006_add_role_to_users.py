"""
Migration: Add role column to users table
Allows users to have roles like investor, mentor, idea creator, etc.
Using VARCHAR instead of ENUM for extensibility
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_add_role_to_users():
    """Add role column to users table"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Adding role column to users table...")
            db.session.execute(text("""
                ALTER TABLE users 
                ADD COLUMN role VARCHAR(50) NULL DEFAULT 'idea_creator'
                AFTER password_hash;
            """))
            print("✓ Added role column to users")
            
            # Add index for better query performance
            print("Adding index for role column...")
            db.session.execute(text("CREATE INDEX idx_users_role ON users(role);"))
            print("✓ Added index on role column")
            
            db.session.commit()
            print("\n Migration 006 completed successfully!")
            print("   - Added role column (VARCHAR) to users table")
            print("   - Set default role to 'idea_creator'")
            print("   - Added index for performance")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n Migration 006 failed: {str(e)}")
            raise

def rollback_add_role_to_users():
    """Rollback: Remove role column from users table"""
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Removing role column from users table...")
            db.session.execute(text("DROP INDEX idx_users_role ON users;"))
            db.session.execute(text("ALTER TABLE users DROP COLUMN role;"))
            db.session.commit()
            print("✓ Rolled back migration 006")
            
        except Exception as e:
            db.session.rollback()
            print(f" Rollback failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate_add_role_to_users()
