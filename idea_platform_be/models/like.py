"""
Like Model
Represents likes/upvotes on ideas
"""

from extensions import db
from datetime import datetime


class Like(db.Model):
    __tablename__ = 'likes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate likes
    __table_args__ = (db.UniqueConstraint('user_id', 'idea_id', name='unique_user_idea_like'),)
    
    def to_dict(self):
        """Convert like object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'idea_id': self.idea_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Like User:{self.user_id} Idea:{self.idea_id}>'
