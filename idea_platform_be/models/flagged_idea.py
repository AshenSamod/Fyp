"""
Flagged Idea Model
Represents reports/flags on ideas by users
"""

from extensions import db
from datetime import datetime


class FlaggedIdea(db.Model):
    __tablename__ = 'flagged_ideas'
    
    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id', ondelete='CASCADE'), nullable=False)
    reported_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, dismissed, action_taken
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by_admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    
    # Relationships
    idea = db.relationship('Idea', backref='flags', lazy=True)
    reporter = db.relationship('User', foreign_keys=[reported_by_user_id], backref='idea_reports', lazy=True)
    reviewer = db.relationship('User', foreign_keys=[reviewed_by_admin_id], backref='reviewed_idea_flags', lazy=True)
    
    # Unique constraint: one user can only report an idea once
    __table_args__ = (
        db.UniqueConstraint('idea_id', 'reported_by_user_id', name='unique_idea_report_per_user'),
    )
    
    def to_dict(self, include_idea=False, include_reporter=False):
        """Convert flagged idea object to dictionary"""
        data = {
            'id': self.id,
            'idea_id': self.idea_id,
            'reported_by_user_id': self.reported_by_user_id,
            'reason': self.reason,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by_admin_id': self.reviewed_by_admin_id
        }
        
        if include_idea and self.idea:
            data['idea'] = {
                'id': self.idea.id,
                'title': self.idea.title,
                'description': self.idea.description[:200] + '...' if len(self.idea.description) > 200 else self.idea.description,
                'user': {
                    'id': self.idea.user_id,
                    'username': self.idea.author.username,
                    'email': self.idea.author.email
                } if self.idea.author else None
            }
        
        if include_reporter and self.reporter:
            data['reporter'] = {
                'id': self.reporter.id,
                'username': self.reporter.username,
                'email': self.reporter.email
            }
        
        return data
    
    def __repr__(self):
        return f'<FlaggedIdea idea_id={self.idea_id} by_user={self.reported_by_user_id}>'
