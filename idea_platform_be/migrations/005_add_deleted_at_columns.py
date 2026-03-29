"""
Migration: Add deleted_at timestamp for soft delete tracking
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_add_deleted_at_columns():
    """Add deleted_at column to users, ideas, and comments tables"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Adding deleted_at column to users table...")
            db.session.execute(text("""
                ALTER TABLE users 
                ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
                AFTER is_active;
            """))
            print("✓ Added deleted_at to users")
            
            print("Adding deleted_at column to ideas table...")
            db.session.execute(text("""
                ALTER TABLE ideas 
                ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
                AFTER is_active;
            """))
            print("✓ Added deleted_at to ideas")
            
            print("Adding deleted_at column to comments table...")
            db.session.execute(text("""
                ALTER TABLE comments 
                ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
                AFTER is_active;
            """))
            print("✓ Added deleted_at to comments")
            
            # Add indexes for better query performance
            print("Adding indexes for deleted_at columns...")
            db.session.execute(text("CREATE INDEX idx_users_deleted_at ON users(deleted_at);"))
            db.session.execute(text("CREATE INDEX idx_ideas_deleted_at ON ideas(deleted_at);"))
            db.session.execute(text("CREATE INDEX idx_comments_deleted_at ON comments(deleted_at);"))
            print("✓ Added indexes")
            
            db.session.commit()
            
            print("✓ Migration successful! Soft delete tracking enabled.")
            print("✓ Now using is_active=False and deleted_at timestamp for soft deletes.")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            # Check if column already exists
            if "duplicate column name" in str(e).lower() or "exists" in str(e).lower():
                print("✓ Columns already exist, skipping...")
            else:
                raise

if __name__ == '__main__':
    migrate_add_deleted_at_columns()
