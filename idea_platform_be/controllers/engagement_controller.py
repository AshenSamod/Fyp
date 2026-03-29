from extensions import db
from models import Like, Idea, User
from sqlalchemy.exc import IntegrityError

class EngagementController:
    
    @staticmethod
    def like_idea(user_id, idea_id):
        """Like an idea"""
        # Convert string ID to integer
        user_id = int(user_id)
        # Verify idea exists
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        # Check if already liked
        existing_like = Like.query.filter_by(user_id=user_id, idea_id=idea_id).first()
        if existing_like:
            return {'error': 'Already liked this idea'}, 400
        
        # Create like
        new_like = Like(user_id=user_id, idea_id=idea_id)
        
        try:
            db.session.add(new_like)
            db.session.commit()
            
            return {
                'message': 'Idea liked successfully',
                'like_count': idea.likes.count()
            }, 201
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Already liked this idea'}, 400
    
    @staticmethod
    def unlike_idea(user_id, idea_id):
        """Unlike an idea"""
        # Convert string ID to integer
        user_id = int(user_id)
        like = Like.query.filter_by(user_id=user_id, idea_id=idea_id).first()
        
        if not like:
            return {'error': 'Like not found'}, 404
        
        db.session.delete(like)
        db.session.commit()
        
        idea = Idea.query.get(idea_id)
        
        return {
            'message': 'Idea unliked successfully',
            'like_count': idea.likes.filter_by(is_active=True).count() if idea else 0
        }, 200
    
    @staticmethod
    def get_idea_likes(idea_id, page=1, per_page=50):
        """Get all users who liked an idea"""
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        query = Like.query.filter_by(idea_id=idea_id).order_by(Like.created_at.desc())
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        likes = []
        for like in paginated.items:
            like_dict = like.to_dict()
            like_dict['user'] = like.user.to_dict()
            likes.append(like_dict)
        
        return {
            'likes': likes,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200
    
    @staticmethod
    def check_user_like(user_id, idea_id):
        """Check if a user has liked an idea"""
        # Convert string ID to integer
        user_id = int(user_id)
        like = Like.query.filter_by(user_id=user_id, idea_id=idea_id).first()
        
        return {
            'liked': like is not None
        }, 200
    
    @staticmethod
    def get_user_liked_ideas(user_id, page=1, per_page=20):
        """Get all ideas liked by a user"""
        # Convert string ID to integer
        user_id = int(user_id)
        query = Like.query.filter_by(user_id=user_id).order_by(Like.created_at.desc())
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        ideas = []
        for like in paginated.items:
            if like.idea and like.idea.is_active:
                ideas.append(like.idea.to_dict())
        
        return {
            'ideas': ideas,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200
