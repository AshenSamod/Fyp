from extensions import db
from models import User, Idea, Comment, Category, TokenBlacklist, FlaggedIdea, FlaggedComment
from sqlalchemy import desc, func
from datetime import datetime, timedelta
from flask import current_app

class AdminController:
    
    @staticmethod
    def _revoke_user_tokens(user_id, reason='user_disabled'):
        """
        Revoke all active tokens for a user by adding placeholder entries to blacklist.
        Note: This marks the user's tokens as invalid. The actual token JTIs will be 
        blacklisted when they try to use them and fail the user.is_active check.
        """
        # Create a blacklist entry with a special marker for this user
        # This will expire after the JWT_ACCESS_TOKEN_EXPIRES time
        from flask import current_app
        expires_delta = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', timedelta(hours=1))
        expires_at = datetime.utcnow() + expires_delta
        
        # Add a marker entry for this user (jti format: user_disabled_{user_id}_{timestamp})
        marker_jti = f"user_disabled_{user_id}_{int(datetime.utcnow().timestamp())}"
        try:
            TokenBlacklist.add_token_to_blacklist(
                jti=marker_jti,
                user_id=user_id,
                token_type='access',
                expires_at=expires_at,
                reason=reason
            )
        except Exception as e:
            # If duplicate, it's okay - user was already disabled
            pass
    
    @staticmethod
    def get_all_users(page=1, per_page=50, user_type=None):
        """Get all users (admin only)
        
        Args:
            page: Page number
            per_page: Items per page
            user_type: Filter by user type - 'admins' for is_admin=True, 'users' for is_admin=False, None for all
        """
        query = User.query.filter_by(is_active=True)
        
        # Filter by user type if specified
        if user_type == 'admins':
            query = query.filter_by(is_admin=True)
        elif user_type == 'users':
            query = query.filter_by(is_admin=False)
        
        query = query.order_by(desc(User.created_at))
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'users': [user.to_dict(include_email=True) for user in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages,
            'user_type': user_type
        }, 200
    
    @staticmethod
    def search_users(query_string, page=1, per_page=50, user_type=None):
        """Search users by name or email (admin only)
        
        Args:
            query_string: Search term
            page: Page number
            per_page: Items per page
            user_type: Filter by user type - 'admins' for is_admin=True, 'users' for is_admin=False, None for all
        """
        if not query_string or len(query_string.strip()) == 0:
            return {'error': 'Search query is required'}, 400
        
        search_term = f"%{query_string}%"
        
        # Search in username, email, and full_name
        query = User.query.filter(
            User.is_active == True
        ).filter(
            db.or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term),
                User.full_name.ilike(search_term)
            )
        )
        
        # Filter by user type if specified
        if user_type == 'admins':
            query = query.filter_by(is_admin=True)
        elif user_type == 'users':
            query = query.filter_by(is_admin=False)
        
        query = query.order_by(desc(User.created_at))
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'users': [user.to_dict(include_email=True) for user in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages,
            'user_type': user_type,
            'query': query_string
        }, 200
    
    @staticmethod
    def make_user_admin(user_id):
        """Grant admin privileges to a user"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        if not user.is_active:
            return {'error': 'Cannot grant admin privileges to inactive user'}, 400
        
        if user.is_admin:
            return {'error': 'User is already an admin'}, 400
        
        user.is_admin = True
        db.session.commit()
        
        return {
            'message': 'User granted admin privileges successfully',
            'user': user.to_dict(include_email=True)
        }, 200
    
    @staticmethod
    def remove_user_admin(user_id, current_admin_id):
        """Remove admin privileges from a user"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        if not user.is_admin:
            return {'error': 'User is not an admin'}, 400
        
        # Prevent removing admin privileges from self
        if int(user_id) == int(current_admin_id):
            return {'error': 'Cannot remove admin privileges from yourself'}, 400
        
        # Check if this is the last admin
        admin_count = User.query.filter_by(is_admin=True, is_active=True).count()
        if admin_count <= 1:
            return {'error': 'Cannot remove the last admin user'}, 400
        
        user.is_admin = False
        db.session.commit()
        
        return {
            'message': 'Admin privileges removed successfully',
            'user': user.to_dict(include_email=True)
        }, 200
    
    @staticmethod
    def disable_user(user_id):
        """Disable a user account and revoke their tokens"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        if user.is_admin:
            return {'error': 'Cannot disable admin users'}, 400
        
        user.is_active = False
        db.session.commit()
        
        # Revoke all user tokens
        AdminController._revoke_user_tokens(user_id, reason='user_disabled')
        
        return {'message': 'User disabled successfully and tokens revoked'}, 200
    
    @staticmethod
    def enable_user(user_id):
        """Enable a user account"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        user.is_active = True
        db.session.commit()
        
        return {'message': 'User enabled successfully'}, 200
    
    @staticmethod
    def delete_user(user_id):
        """Soft delete a user"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        if user.is_admin:
            return {'error': 'Cannot delete admin users'}, 400
        
        # Soft delete
        user.is_active = False
        user.deleted_at = datetime.utcnow()
        db.session.commit()
        
        # Revoke all user tokens
        AdminController._revoke_user_tokens(user_id, reason='user_deleted')
        
        return {'message': 'User deleted successfully'}, 200
    
    @staticmethod
    def delete_idea(idea_id):
        """Soft delete an idea (admin) and mark all reports as action_taken"""
        idea = Idea.query.get(idea_id)
        
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        # Soft delete the idea
        idea.is_active = False
        idea.deleted_at = datetime.utcnow()
        
        # Update all reports for this idea to "action_taken"
        flagged_reports = FlaggedIdea.query.filter_by(idea_id=idea_id).all()
        report_count = len(flagged_reports)
        
        for report in flagged_reports:
            report.status = 'action_taken'
            report.reviewed_at = datetime.utcnow()
            # Note: reviewed_by_admin_id would need to be passed from the route if needed
        
        db.session.commit()
        
        message = f'Idea deleted successfully'
        if report_count > 0:
            message += f' and {report_count} report(s) marked as action taken'
        
        return {'message': message, 'reports_updated': report_count}, 200
    
    @staticmethod
    def delete_comment(comment_id):
        """Soft delete a comment (admin) and mark all reports as action_taken"""
        comment = Comment.query.get(comment_id)
        
        if not comment:
            return {'error': 'Comment not found'}, 404
        
        # Soft delete the comment
        comment.is_active = False
        comment.deleted_at = datetime.utcnow()
        
        # Update all reports for this comment to "action_taken"
        flagged_reports = FlaggedComment.query.filter_by(comment_id=comment_id).all()
        report_count = len(flagged_reports)
        
        for report in flagged_reports:
            report.status = 'action_taken'
            report.reviewed_at = datetime.utcnow()
            # Note: reviewed_by_admin_id would need to be passed from the route if needed
        
        db.session.commit()
        
        message = f'Comment deleted successfully'
        if report_count > 0:
            message += f' and {report_count} report(s) marked as action taken'
        
        return {'message': message, 'reports_updated': report_count}, 200
    
    @staticmethod
    def get_statistics():
        """Get platform statistics"""
        total_users = User.query.filter_by(is_active=True).count()
        active_users = User.query.filter_by(is_active=True).count()
        total_ideas = Idea.query.filter_by(is_active=True).count()
        total_comments = Comment.query.filter_by(is_active=True).count()
        total_categories = Category.query.count()
        
        # Get category distribution
        categories = Category.query.all()
        category_distribution = []
        for cat in categories:
            category_distribution.append({
                'category': cat.name,
                'idea_count': cat.ideas.filter_by(is_active=True).count()
            })
        
        return {
            'statistics': {
                'total_users': total_users,
                'active_users': active_users,
                'total_ideas': total_ideas,
                'total_comments': total_comments,
                'total_categories': total_categories,
                'category_distribution': category_distribution
            }
        }, 200
    
    @staticmethod
    def update_idea_category(idea_id, category_name):
        """Manually update idea category (for ML feedback)"""
        idea = Idea.query.get(idea_id)
        
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.flush()
        
        idea.category_id = category.id
        idea.is_category_corrected = True
        db.session.commit()
        
        return {
            'message': 'Category updated successfully',
            'idea': idea.to_dict()
        }, 200
    
    @staticmethod
    def get_flagged_ideas(page=1, per_page=20, status='pending'):
        """Get flagged ideas sorted by most reported"""
        # Count reports per idea
        query = db.session.query(
            FlaggedIdea.idea_id,
            func.count(FlaggedIdea.id).label('report_count')
        )
        
        if status and status != 'all':
            query = query.filter(FlaggedIdea.status == status)
        
        # Group by idea_id and order by count descending
        subquery = query.group_by(FlaggedIdea.idea_id)\
            .order_by(desc('report_count'))\
            .subquery()
        
        # Join with FlaggedIdea to get full details
        flagged_ideas_query = db.session.query(FlaggedIdea, subquery.c.report_count)\
            .join(subquery, FlaggedIdea.idea_id == subquery.c.idea_id)
        
        if status and status != 'all':
            flagged_ideas_query = flagged_ideas_query.filter(FlaggedIdea.status == status)
        
        # Get distinct ideas with their report count
        # Group by idea_id to get one entry per idea with all reports
        idea_reports = {}
        for flag, report_count in flagged_ideas_query.all():
            if flag.idea_id not in idea_reports:
                idea_reports[flag.idea_id] = {
                    'idea_id': flag.idea_id,
                    'report_count': report_count,
                    'reports': [],
                    'idea': flag.idea
                }
            idea_reports[flag.idea_id]['reports'].append(flag)
        
        # Sort by report count and paginate manually
        sorted_ideas = sorted(idea_reports.values(), key=lambda x: x['report_count'], reverse=True)
        
        # Manual pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated_ideas = sorted_ideas[start:end]
        
        # Format response
        results = []
        for item in paginated_ideas:
            idea_data = None
            if item['idea']:
                idea_data = {
                    'id': item['idea'].id,
                    'title': item['idea'].title,
                    'description': item['idea'].description[:200] + '...' if len(item['idea'].description) > 200 else item['idea'].description,
                    'user': {
                        'id': item['idea'].user_id,
                        'username': item['idea'].author.username if item['idea'].author else None,
                        'email': item['idea'].author.email if item['idea'].author else None
                    }
                }
            
            results.append({
                'idea_id': item['idea_id'],
                'report_count': item['report_count'],
                'idea': idea_data,
                'reports': [flag.to_dict(include_reporter=True) for flag in item['reports'][:5]]  # Limit to first 5 reports
            })
        
        return {
            'flagged_ideas': results,
            'total': len(sorted_ideas),
            'page': page,
            'per_page': per_page,
            'pages': (len(sorted_ideas) + per_page - 1) // per_page
        }, 200
    
    @staticmethod
    def get_flagged_comments(page=1, per_page=20, status='pending'):
        """Get flagged comments sorted by most reported"""
        # Count reports per comment
        query = db.session.query(
            FlaggedComment.comment_id,
            func.count(FlaggedComment.id).label('report_count')
        )
        
        if status and status != 'all':
            query = query.filter(FlaggedComment.status == status)
        
        # Group by comment_id and order by count descending
        subquery = query.group_by(FlaggedComment.comment_id)\
            .order_by(desc('report_count'))\
            .subquery()
        
        # Join with FlaggedComment to get full details
        flagged_comments_query = db.session.query(FlaggedComment, subquery.c.report_count)\
            .join(subquery, FlaggedComment.comment_id == subquery.c.comment_id)
        
        if status and status != 'all':
            flagged_comments_query = flagged_comments_query.filter(FlaggedComment.status == status)
        
        # Get distinct comments with their report count
        comment_reports = {}
        for flag, report_count in flagged_comments_query.all():
            if flag.comment_id not in comment_reports:
                comment_reports[flag.comment_id] = {
                    'comment_id': flag.comment_id,
                    'report_count': report_count,
                    'reports': [],
                    'comment': flag.comment
                }
            comment_reports[flag.comment_id]['reports'].append(flag)
        
        # Sort by report count and paginate manually
        sorted_comments = sorted(comment_reports.values(), key=lambda x: x['report_count'], reverse=True)
        
        # Manual pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated_comments = sorted_comments[start:end]
        
        # Format response
        results = []
        for item in paginated_comments:
            comment_data = None
            if item['comment']:
                # Get idea details if comment has associated idea
                idea_data = None
                if item['comment'].idea:
                    idea_data = {
                        'id': item['comment'].idea.id,
                        'title': item['comment'].idea.title
                    }
                
                comment_data = {
                    'id': item['comment'].id,
                    'content': item['comment'].content[:200] + '...' if len(item['comment'].content) > 200 else item['comment'].content,
                    'idea_id': item['comment'].idea_id,
                    'idea': idea_data,
                    'user': {
                        'id': item['comment'].user_id,
                        'username': item['comment'].author.username if item['comment'].author else None,
                        'email': item['comment'].author.email if item['comment'].author else None
                    }
                }
            
            results.append({
                'comment_id': item['comment_id'],
                'report_count': item['report_count'],
                'comment': comment_data,
                'reports': [flag.to_dict(include_reporter=True) for flag in item['reports'][:5]]  # Limit to first 5 reports
            })
        
        return {
            'flagged_comments': results,
            'total': len(sorted_comments),
            'page': page,
            'per_page': per_page,
            'pages': (len(sorted_comments) + per_page - 1) // per_page
        }, 200
    
    @staticmethod
    def update_flag_status(flag_type, flag_id, status, admin_id):
        """Update the status of a flag (idea or comment)"""
        if flag_type not in ['idea', 'comment']:
            return {'error': 'Invalid flag type'}, 400
        
        if status not in ['pending', 'reviewed', 'dismissed', 'action_taken']:
            return {'error': 'Invalid status'}, 400
        
        if flag_type == 'idea':
            flag = FlaggedIdea.query.get(flag_id)
        else:
            flag = FlaggedComment.query.get(flag_id)
        
        if not flag:
            return {'error': 'Flag not found'}, 404
        
        flag.status = status
        flag.reviewed_at = datetime.utcnow()
        flag.reviewed_by_admin_id = int(admin_id)
        
        db.session.commit()
        
        return {
            'message': 'Flag status updated successfully',
            'flag': flag.to_dict()
        }, 200
    
    @staticmethod
    def update_all_flags_for_content(content_type, content_id, status, admin_id):
        """Update all flags for a specific idea or comment"""
        if content_type not in ['idea', 'comment']:
            return {'error': 'Invalid content type'}, 400
        
        if status not in ['pending', 'reviewed', 'dismissed', 'action_taken']:
            return {'error': 'Invalid status'}, 400
        
        if content_type == 'idea':
            flags = FlaggedIdea.query.filter_by(idea_id=content_id).all()
        else:
            flags = FlaggedComment.query.filter_by(comment_id=content_id).all()
        
        if not flags:
            return {'error': 'No flags found'}, 404
        
        for flag in flags:
            flag.status = status
            flag.reviewed_at = datetime.utcnow()
            flag.reviewed_by_admin_id = int(admin_id)
        
        db.session.commit()
        
        return {
            'message': f'All {len(flags)} flag(s) updated successfully',
            'updated_count': len(flags)
        }, 200
    
    @staticmethod
    def get_all_categories(include_inactive=False):
        """Get all categories"""
        if include_inactive:
            categories = Category.query.order_by(Category.name).all()
        else:
            categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        
        return {
            'categories': [cat.to_dict() for cat in categories],
            'total': len(categories)
        }, 200
    
    @staticmethod
    def create_category(name, description=None):
        """Create a new category"""
        # Check if category already exists
        existing = Category.query.filter_by(name=name).first()
        if existing:
            return {'error': 'Category with this name already exists'}, 400
        
        new_category = Category(
            name=name.lower().strip(),
            description=description,
            is_active=True
        )
        
        db.session.add(new_category)
        db.session.commit()
        
        return {
            'message': 'Category created successfully',
            'category': new_category.to_dict()
        }, 201
    
    @staticmethod
    def update_category(category_id, name=None, description=None):
        """Update a category"""
        category = Category.query.get(category_id)
        
        if not category:
            return {'error': 'Category not found'}, 404
        
        # If updating name, check for duplicates
        if name and name.lower().strip() != category.name:
            existing = Category.query.filter_by(name=name.lower().strip()).first()
            if existing:
                return {'error': 'Category with this name already exists'}, 400
            category.name = name.lower().strip()
        
        if description is not None:
            category.description = description
        
        db.session.commit()
        
        return {
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }, 200
    
    @staticmethod
    def toggle_category_status(category_id):
        """Toggle category active/inactive status"""
        category = Category.query.get(category_id)
        
        if not category:
            return {'error': 'Category not found'}, 404
        
        # Toggle the status
        category.is_active = not category.is_active
        db.session.commit()
        
        status = 'activated' if category.is_active else 'deactivated'
        return {
            'message': f'Category {status} successfully',
            'category': category.to_dict()
        }, 200
    
    @staticmethod
    def delete_category(category_id):
        """Delete a category (only if no ideas are using it)"""
        category = Category.query.get(category_id)
        
        if not category:
            return {'error': 'Category not found'}, 404
        
        # Check if any ideas are using this category
        idea_count = category.ideas.filter_by(is_active=True).count()
        if idea_count > 0:
            return {
                'error': f'Cannot delete category. {idea_count} active idea(s) are using this category.',
                'idea_count': idea_count
            }, 400
        
        db.session.delete(category)
        db.session.commit()
        
        return {
            'message': 'Category deleted successfully'
        }, 200
