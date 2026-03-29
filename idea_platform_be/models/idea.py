"""
Idea Model
Represents user-submitted ideas
"""

from extensions import db
from datetime import datetime


class Idea(db.Model):
    __tablename__ = 'ideas'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    ml_category_scores = db.Column(db.JSON)  # Store raw ML scores
    is_category_corrected = db.Column(db.Boolean, default=False)  # For feedback loop
    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True, default=None, index=True)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    comments = db.relationship('Comment', backref='idea', lazy='dynamic', cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='idea', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_author=True, include_engagement=True):
        """Convert idea object to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category.to_dict() if self.category else None,
            'is_category_corrected': self.is_category_corrected,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_author:
            data['author'] = self.author.to_dict()
        
        if include_engagement:
            data['like_count'] = self.likes.count()
            data['comment_count'] = self.comments.filter_by(is_active=True).count()
        
        return data
    
    def __repr__(self):
        return f'<Idea {self.title}>'
