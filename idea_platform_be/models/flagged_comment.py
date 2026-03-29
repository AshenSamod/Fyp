"""
Flagged Comment Model
Represents reports/flags on comments by users
"""

from extensions import db
from datetime import datetime


class FlaggedComment(db.Model):
    __tablename__ = 'flagged_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id', ondelete='CASCADE'), nullable=False)
    reported_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, dismissed, action_taken
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by_admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    
    # Relationships
    comment = db.relationship('Comment', backref='flags', lazy=True)
    reporter = db.relationship('User', foreign_keys=[reported_by_user_id], backref='comment_reports', lazy=True)
    reviewer = db.relationship('User', foreign_keys=[reviewed_by_admin_id], backref='reviewed_comment_flags', lazy=True)
    
    # Unique constraint: one user can only report a comment once
    __table_args__ = (
        db.UniqueConstraint('comment_id', 'reported_by_user_id', name='unique_comment_report_per_user'),
    )
    
    def to_dict(self, include_comment=False, include_reporter=False):
        """Convert flagged comment object to dictionary"""
        data = {
            'id': self.id,
            'comment_id': self.comment_id,
            'reported_by_user_id': self.reported_by_user_id,
            'reason': self.reason,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by_admin_id': self.reviewed_by_admin_id
        }
        
        if include_comment and self.comment:
            data['comment'] = {
                'id': self.comment.id,
                'content': self.comment.content[:200] + '...' if len(self.comment.content) > 200 else self.comment.content,
                'idea_id': self.comment.idea_id,
                'user': {
                    'id': self.comment.user_id,
                    'username': self.comment.author.username,
                    'email': self.comment.author.email
                } if self.comment.author else None
            }
        
        if include_reporter and self.reporter:
            data['reporter'] = {
                'id': self.reporter.id,
                'username': self.reporter.username,
                'email': self.reporter.email
            }
        
        return data
    
    def __repr__(self):
        return f'<FlaggedComment comment_id={self.comment_id} by_user={self.reported_by_user_id}>'
