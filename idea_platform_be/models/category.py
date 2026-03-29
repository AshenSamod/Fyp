"""
Category Model
Represents idea categories
"""

from extensions import db
from datetime import datetime


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    ideas = db.relationship('Idea', backref='category', lazy='dynamic')
    
    def to_dict(self):
        """Convert category object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'idea_count': self.ideas.filter_by(is_active=True).count()
        }
    
    def __repr__(self):
        return f'<Category {self.name}>'
