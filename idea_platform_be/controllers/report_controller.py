"""
Report Controller
Handles reporting of ideas and comments
"""

from extensions import db
from models import FlaggedIdea, FlaggedComment, Idea, Comment, User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError


class ReportController:
    
    @staticmethod
    def report_idea(idea_id, user_id, reason, description=None):
        """Report an idea"""
        # Check if idea exists and is active
        idea = Idea.query.get(idea_id)
        if not idea or not idea.is_active:
            return {'error': 'Idea not found'}, 404
        
        # Users cannot report their own ideas
        if idea.user_id == int(user_id):
            return {'error': 'You cannot report your own idea'}, 400
        
        # Create flag
        try:
            flag = FlaggedIdea(
                idea_id=idea_id,
                reported_by_user_id=int(user_id),
                reason=reason,
                description=description,
                status='pending'
            )
            db.session.add(flag)
            db.session.commit()
            
            return {
                'message': 'Idea reported successfully',
                'report': flag.to_dict()
            }, 201
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'You have already reported this idea'}, 409
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to report idea: {str(e)}'}, 500
    
    @staticmethod
    def report_comment(comment_id, user_id, reason, description=None):
        """Report a comment"""
        # Check if comment exists and is active
        comment = Comment.query.get(comment_id)
        if not comment or not comment.is_active:
            return {'error': 'Comment not found'}, 404
        
        # Users cannot report their own comments
        if comment.user_id == int(user_id):
            return {'error': 'You cannot report your own comment'}, 400
        
        # Create flag
        try:
            flag = FlaggedComment(
                comment_id=comment_id,
                reported_by_user_id=int(user_id),
                reason=reason,
                description=description,
                status='pending'
            )
            db.session.add(flag)
            db.session.commit()
            
            return {
                'message': 'Comment reported successfully',
                'report': flag.to_dict()
            }, 201
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'You have already reported this comment'}, 409
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to report comment: {str(e)}'}, 500
    
    @staticmethod
    def get_my_reports(user_id, page=1, per_page=20):
        """Get reports submitted by the current user"""
        user_id = int(user_id)
        
        # Get idea reports
        idea_reports = FlaggedIdea.query.filter_by(reported_by_user_id=user_id)\
            .order_by(FlaggedIdea.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        # Get comment reports
        comment_reports = FlaggedComment.query.filter_by(reported_by_user_id=user_id)\
            .order_by(FlaggedComment.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'idea_reports': {
                'items': [report.to_dict(include_idea=True) for report in idea_reports.items],
                'total': idea_reports.total,
                'page': page,
                'per_page': per_page,
                'pages': idea_reports.pages
            },
            'comment_reports': {
                'items': [report.to_dict(include_comment=True) for report in comment_reports.items],
                'total': comment_reports.total,
                'page': page,
                'per_page': per_page,
                'pages': comment_reports.pages
            }
        }, 200
