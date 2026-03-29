from extensions import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token, create_refresh_token

class AuthController:
    
    @staticmethod
    def register_user(username, email, password, full_name=None, role='idea_creator'):
        """Register a new user"""
        # Check if user already exists
        if username and User.query.filter_by(username=username).first():
            return {'error': 'Username already exists'}, 400
        
        if User.query.filter_by(email=email).first():
            return {'error': 'Email already registered'}, 400
        
        # Validate role
        valid_roles = ['investor', 'mentor', 'idea_creator']
        if role not in valid_roles:
            return {'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}, 400
        
        # Hash password
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role=role
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate tokens with additional claims
        additional_claims = {
            'role': new_user.role,
            'is_admin': new_user.is_admin
        }
        access_token = create_access_token(identity=str(new_user.id), additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=str(new_user.id))
        
        return {
            'message': 'User registered successfully',
            'user': new_user.to_dict(include_email=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 201
    
    @staticmethod
    def login_user(email, password):
        """Login a user via email"""
        user = User.query.filter_by(email=email).first()
        if not user:
            return {'error': 'User not found'}, 404

        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return {'error': 'Invalid credentials'}, 401
        
        if not user.is_active:
            return {'error': 'Account is disabled'}, 403
        
        # Generate tokens with additional claims
        additional_claims = {
            'role': user.role,
            'is_admin': user.is_admin
        }
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'message': 'Login successful',
            'user': user.to_dict(include_email=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 200
    
    @staticmethod
    def get_user_profile(user_id):
        """Get user profile"""
        # Convert string ID back to integer
        user = User.query.get(int(user_id))
        
        if not user or not user.is_active:
            return {'error': 'User not found'}, 404
        
        return {
            'user': user.to_dict(include_email=True)
        }, 200
    
    @staticmethod
    def update_user_profile(user_id, full_name=None, bio=None, email=None):
        """Update user profile"""
        # Convert string ID back to integer
        user = User.query.get(int(user_id))
        
        if not user or not user.is_active:
            return {'error': 'User not found'}, 404
        
        # Update fields if provided
        if full_name is not None:
            user.full_name = full_name
        
        if bio is not None:
            user.bio = bio
        
        if email is not None:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=email).first()
            if existing_user and str(existing_user.id) != str(user_id):
                return {'error': 'Email already in use. your user id is {}'.format(user_id)}, 400
            user.email = email
        
        db.session.commit()
        
        return {
            'message': 'Profile updated successfully',
            'user': user.to_dict(include_email=True)
        }, 200
    
    @staticmethod
    def refresh_access_token(user_id):
        """Generate new access token"""
        # Convert string ID back to integer
        user = User.query.get(int(user_id))
        
        if not user or not user.is_active:
            return {'error': 'Invalid user'}, 401
        
        # Generate token with additional claims
        additional_claims = {
            'role': user.role,
            'is_admin': user.is_admin
        }
        access_token = create_access_token(identity=str(user_id), additional_claims=additional_claims)
        
        return {
            'access_token': access_token
        }, 200
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """Change user password"""
        # Convert string ID back to integer
        user = User.query.get(int(user_id))
        
        if not user or not user.is_active:
            return {'error': 'User not found'}, 404
        
        # Verify old password
        if not bcrypt.check_password_hash(user.password_hash, old_password):
            return {'error': 'Current password is incorrect'}, 401
        
        # Validate new password
        if len(new_password) < 6:
            return {'error': 'New password must be at least 6 characters long'}, 400
        
        # Hash and update new password
        user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()
        
        return {
            'message': 'Password changed successfully'
        }, 200
    
    @staticmethod
    def delete_own_account(user_id, password):
        """Soft delete user's own account along with all their content"""
        from models import Idea, Comment
        from datetime import datetime
        
        # Convert string ID back to integer
        user = User.query.get(int(user_id))
        
        if not user or not user.is_active:
            return {'error': 'User not found'}, 404
        
        # Verify password for security
        if not bcrypt.check_password_hash(user.password_hash, password):
            return {'error': 'Password is incorrect'}, 401
        
        # Soft delete all user's ideas
        user_ideas = Idea.query.filter_by(user_id=int(user_id), is_active=True).all()
        ideas_deleted = len(user_ideas)
        for idea in user_ideas:
            idea.is_active = False
            idea.deleted_at = datetime.utcnow()
        
        # Soft delete all user's comments
        user_comments = Comment.query.filter_by(user_id=int(user_id), is_active=True).all()
        comments_deleted = len(user_comments)
        for comment in user_comments:
            comment.is_active = False
            comment.deleted_at = datetime.utcnow()
        
        # Soft delete the user account
        user.is_active = False
        user.deleted_at = datetime.utcnow()
        
        db.session.commit()
        
        return {
            'message': 'Account deleted successfully',
            'details': {
                'ideas_deleted': ideas_deleted,
                'comments_deleted': comments_deleted
            }
        }, 200
