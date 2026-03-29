"""
Migration: Add flagged_ideas and flagged_comments tables for content reporting
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db
from sqlalchemy import text

def migrate_add_flagged_content_tables():
    """Create flagged_ideas and flagged_comments tables"""
    # Import app here to avoid circular imports
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Creating flagged_ideas table...")
            
            # Create flagged_ideas table
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS flagged_ideas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    idea_id INT NOT NULL,
                    reported_by_user_id INT NOT NULL,
                    reason VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at DATETIME,
                    reviewed_by_admin_id INT,
                    INDEX idx_idea_id (idea_id),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at),
                    UNIQUE KEY unique_idea_report_per_user (idea_id, reported_by_user_id),
                    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
                    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """))
            
            print("✓ flagged_ideas table created")
            
            print("Creating flagged_comments table...")
            
            # Create flagged_comments table
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS flagged_comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    comment_id INT NOT NULL,
                    reported_by_user_id INT NOT NULL,
                    reason VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at DATETIME,
                    reviewed_by_admin_id INT,
                    INDEX idx_comment_id (comment_id),
                    INDEX idx_status (status),
                    INDEX idx_created_at (created_at),
                    UNIQUE KEY unique_comment_report_per_user (comment_id, reported_by_user_id),
                    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
                    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """))
            
            print("✓ flagged_comments table created")
            
            db.session.commit()
            
            print("✓ Migration successful! Content reporting tables created.")
            print("✓ Users can now report inappropriate ideas and comments.")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            # Check if table already exists
            if "already exists" in str(e).lower():
                print("✓ Tables already exist, skipping...")
            else:
                raise

if __name__ == '__main__':
    migrate_add_flagged_content_tables()
