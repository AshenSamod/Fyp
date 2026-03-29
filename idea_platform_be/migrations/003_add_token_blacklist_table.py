"""
Migration: Add token_blacklist table for JWT token revocation
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_add_token_blacklist():
    """Create token_blacklist table for JWT token revocation"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Creating token_blacklist table...")
            
            # Create token_blacklist table
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS token_blacklist (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    jti VARCHAR(255) UNIQUE NOT NULL,
                    user_id INT NOT NULL,
                    token_type VARCHAR(20) NOT NULL,
                    revoked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    reason VARCHAR(100),
                    INDEX idx_jti (jti),
                    INDEX idx_user_id (user_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """))
            db.session.commit()
            
            print("✓ Migration successful! Token blacklist table created.")
            print("✓ Tokens can now be revoked when users logout or are disabled.")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            # Check if table already exists
            if "already exists" in str(e).lower():
                print("✓ Table already exists, skipping...")
            else:
                raise

if __name__ == '__main__':
    migrate_add_token_blacklist()
