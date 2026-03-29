"""
Token Blacklist Model
Stores revoked/blacklisted JWT tokens
"""

from extensions import db
from datetime import datetime


class TokenBlacklist(db.Model):
    __tablename__ = 'token_blacklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), unique=True, nullable=False, index=True)  # JWT Token Identifier
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token_type = db.Column(db.String(20), nullable=False)  # 'access' or 'refresh'
    revoked_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(100))  # 'user_disabled', 'logout', 'manual_revoke', etc.
    
    def __repr__(self):
        return f'<TokenBlacklist {self.jti}>'
    
    @classmethod
    def is_jti_blacklisted(cls, jti):
        """Check if a token JTI is blacklisted"""
        token = cls.query.filter_by(jti=jti).first()
        return token is not None
    
    @classmethod
    def add_token_to_blacklist(cls, jti, user_id, token_type, expires_at, reason='logout'):
        """Add a token to the blacklist"""
        blacklisted_token = cls(
            jti=jti,
            user_id=user_id,
            token_type=token_type,
            expires_at=expires_at,
            reason=reason
        )
        db.session.add(blacklisted_token)
        db.session.commit()
