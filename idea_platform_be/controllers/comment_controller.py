from extensions import db
from models import Comment, Idea, User

class CommentController:
    
    @staticmethod
    def create_comment(user_id, idea_id, content, parent_id=None):
        """Create a new comment on an idea"""
        # Convert string ID to integer
        user_id = int(user_id)
        # Verify idea exists
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        # Verify parent comment exists if provided
        if parent_id:
            parent = Comment.query.filter_by(id=parent_id, is_active=True).first()
            if not parent or parent.idea_id != idea_id:
                return {'error': 'Invalid parent comment'}, 400
        
        # Create comment
        new_comment = Comment(
            content=content,
            user_id=user_id,
            idea_id=idea_id,
            parent_id=parent_id
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        return {
            'message': 'Comment created successfully',
            'comment': new_comment.to_dict()
        }, 201
    
    @staticmethod
    def get_idea_comments(idea_id, page=1, per_page=50):
        """Get all comments for an idea"""
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        # Get top-level comments (no parent)
        query = Comment.query.filter_by(
            idea_id=idea_id, 
            is_active=True, 
            parent_id=None
        ).order_by(Comment.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        comments = []
        for comment in paginated.items:
            comment_dict = comment.to_dict()
            # Include replies
            replies = Comment.query.filter_by(
                parent_id=comment.id, 
                is_active=True
            ).order_by(Comment.created_at.asc()).all()
            comment_dict['replies'] = [reply.to_dict() for reply in replies]
            comments.append(comment_dict)
        
        return {
            'comments': comments,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200
    
    @staticmethod
    def update_comment(comment_id, user_id, content):
        """Update a comment"""
        # Convert string ID to integer
        user_id = int(user_id)
        comment = Comment.query.filter_by(id=comment_id, is_active=True).first()
        
        if not comment:
            return {'error': 'Comment not found'}, 404
        
        if comment.user_id != user_id:
            return {'error': 'Unauthorized to update this comment'}, 403
        
        comment.content = content
        db.session.commit()
        
        return {
            'message': 'Comment updated successfully',
            'comment': comment.to_dict()
        }, 200
    
    @staticmethod
    def delete_comment(comment_id, user_id):
        """Soft delete a comment"""
        # Convert string ID to integer
        user_id = int(user_id)
        comment = Comment.query.filter_by(id=comment_id, is_active=True).first()
        
        if not comment:
            return {'error': 'Comment not found'}, 404
        
        if comment.user_id != user_id:
            return {'error': 'Unauthorized to delete this comment'}, 403
        
        # Soft delete
        from datetime import datetime
        comment.is_active = False
        comment.deleted_at = datetime.utcnow()
        db.session.commit()
        
        return {'message': 'Comment deleted successfully'}, 200
