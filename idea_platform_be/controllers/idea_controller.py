from extensions import db
from models import Idea, Category, User
from services.ml_service import ml_service
from sqlalchemy import or_, desc, and_
from datetime import datetime
import re

class IdeaController:
    
    @staticmethod
    def _strip_html_tags(text):
        """Remove HTML tags from text"""
        if not text:
            return text
        # Remove HTML tags
        clean_text = re.sub(r'<[^>]+>', '', text)
        # Remove HTML entities like &nbsp; &amp; etc.
        clean_text = re.sub(r'&[a-zA-Z]+;', ' ', clean_text)
        # Remove numeric HTML entities like &#160;
        clean_text = re.sub(r'&#\d+;', ' ', clean_text)
        # Remove extra whitespace
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        return clean_text
    
    @staticmethod
    def _truncate_description(description, max_length=500):
        """Truncate description to max_length characters and add ellipsis if needed"""
        if not description:
            return description
        
        # Strip HTML tags first
        clean_desc = IdeaController._strip_html_tags(description)
        
        # Truncate if necessary
        if len(clean_desc) > max_length:
            return clean_desc[:max_length].rstrip() + '...'
        return clean_desc
    
    @staticmethod
    def create_idea(user_id, title, description, category_name=None):
        """Create a new idea with automatic ML categorization"""
        # Convert string ID to integer
        user_id = int(user_id)
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        # Use ML to categorize the idea
        ml_result = ml_service.find_category(description)
        predicted_category = ml_result['result']
        category_scores = ml_result['category_scores']
        
        # If user provided a category, use it and mark as corrected
        if category_name:
            category = Category.query.filter_by(name=category_name).first()
            is_corrected = (category_name != predicted_category)
        else:
            # Use ML prediction
            category = Category.query.filter_by(name=predicted_category).first()
            is_corrected = False
        
        # Create category if it doesn't exist
        if not category:
            category = Category(name=category_name or predicted_category)
            db.session.add(category)
            db.session.flush()
        
        # Create the idea
        new_idea = Idea(
            title=title,
            description=description,
            user_id=user_id,
            category_id=category.id,
            ml_category_scores=category_scores,
            is_category_corrected=is_corrected
        )
        
        db.session.add(new_idea)
        db.session.commit()
        
        return {
            'message': 'Idea created successfully',
            'idea': new_idea.to_dict(),
            'ml_prediction': {
                'predicted_category': predicted_category,
                'category_scores': category_scores
            }
        }, 201
    
    @staticmethod
    def get_idea(idea_id, viewer_id=None):
        """Get a specific idea by ID and track view count"""
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        # Increment view count only if viewer is not the author
        if viewer_id and int(viewer_id) != idea.user_id:
            idea.view_count += 1
            db.session.commit()

        # Include author email in response (no external SMTP call)
        idea_data = idea.to_dict(include_author=False)
        if idea.author:
            idea_data['author'] = idea.author.to_dict(include_email=True)

        return {'idea': idea_data}, 200
    
    @staticmethod
    def get_all_ideas(page=1, per_page=20, category=None, search=None, sort_by='recent'):
        """Get all ideas with filtering and pagination
        
        sort_by options:
        - 'recent': Newest ideas first (default)
        - 'oldest': Oldest ideas first
        - 'views_asc': Least viewed first
        - 'views_desc': Most viewed first
        - 'comments_asc': Fewest comments first
        - 'comments_desc': Most comments first
        """
        query = Idea.query.filter_by(is_active=True)
        
        # Filter by category
        if category:
            cat = Category.query.filter_by(name=category).first()
            if cat:
                query = query.filter_by(category_id=cat.id)
        
        # Search by title or description
        if search:
            query = query.filter(
                or_(
                    Idea.title.contains(search),
                    Idea.description.contains(search)
                )
            )
        
        # Sort
        if sort_by == 'views_desc':
            query = query.order_by(desc(Idea.view_count))
        elif sort_by == 'views_asc':
            query = query.order_by(Idea.view_count)
        elif sort_by == 'comments_desc':
            from models import Comment
            query = query.outerjoin(Comment).group_by(Idea.id).order_by(
                db.func.count(Comment.id).desc()
            )
        elif sort_by == 'comments_asc':
            from models import Comment
            query = query.outerjoin(Comment).group_by(Idea.id).order_by(
                db.func.count(Comment.id)
            )
        elif sort_by == 'oldest':
            query = query.order_by(Idea.created_at)
        else:  # recent (default)
            query = query.order_by(desc(Idea.created_at))
        
        # Paginate
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Process ideas to truncate descriptions
        ideas_list = []
        for idea in paginated.items:
            idea_dict = idea.to_dict()
            # Truncate and clean description
            idea_dict['description'] = IdeaController._truncate_description(idea.description, max_length=500)
            ideas_list.append(idea_dict)
        
        return {
            'ideas': ideas_list,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200
    
    @staticmethod
    def update_idea(idea_id, user_id, title=None, description=None, category_name=None):
        """Update an existing idea"""
        # Convert string ID to integer
        user_id = int(user_id)
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        if idea.user_id != user_id:
            return {'error': 'Unauthorized to update this idea'}, 403
        
        # Update fields
        if title:
            idea.title = title
        
        if description:
            idea.description = description
            # Re-categorize if description changed
            ml_result = ml_service.find_category(description)
            idea.ml_category_scores = ml_result['category_scores']
        
        if category_name:
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                category = Category(name=category_name)
                db.session.add(category)
                db.session.flush()
            
            idea.category_id = category.id
            # Mark as corrected if different from ML prediction
            if idea.ml_category_scores:
                predicted = max(idea.ml_category_scores, key=idea.ml_category_scores.get)
                idea.is_category_corrected = (category_name != predicted)
        
        db.session.commit()
        
        return {
            'message': 'Idea updated successfully',
            'idea': idea.to_dict()
        }, 200
    
    @staticmethod
    def delete_idea(idea_id, user_id):
        """Soft delete an idea"""
        # Convert string ID to integer
        user_id = int(user_id)
        idea = Idea.query.filter_by(id=idea_id, is_active=True).first()
        
        if not idea:
            return {'error': 'Idea not found'}, 404
        
        if idea.user_id != user_id:
            return {'error': 'Unauthorized to delete this idea'}, 403
        
        # Soft delete
        idea.is_active = False
        idea.deleted_at = datetime.utcnow()
        db.session.commit()
        
        return {'message': 'Idea deleted successfully'}, 200
    
    @staticmethod
    def get_user_ideas(user_id, page=1, per_page=20):
        """Get all ideas by a specific user"""
        query = Idea.query.filter_by(user_id=user_id, is_active=True).order_by(desc(Idea.created_at))
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Process ideas to truncate descriptions
        ideas_list = []
        for idea in paginated.items:
            idea_dict = idea.to_dict()
            # Truncate and clean description
            idea_dict['description'] = IdeaController._truncate_description(idea.description, max_length=500)
            ideas_list.append(idea_dict)
        
        return {
            'ideas': ideas_list,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200
    
    @staticmethod
    def search_ideas(page=1, per_page=20, search_query=None, category=None, date_from=None, date_to=None, sort_by='recent'):
        """
        Advanced search for ideas with multiple filters
        - search_query: Search in title and description
        - category: Filter by category name
        - date_from: Filter ideas created from this date (YYYY-MM-DD)
        - date_to: Filter ideas created until this date (YYYY-MM-DD)
        - sort_by options:
          - 'recent': Newest ideas first (default)
          - 'oldest': Oldest ideas first
          - 'views_asc': Least viewed first
          - 'views_desc': Most viewed first
          - 'comments_asc': Fewest comments first
          - 'comments_desc': Most comments first
        """
        query = Idea.query.filter_by(is_active=True)
        
        # Apply search query filter
        if search_query:
            query = query.filter(
                or_(
                    Idea.title.ilike(f'%{search_query}%'),
                    Idea.description.ilike(f'%{search_query}%')
                )
            )
        
        # Apply category filter
        if category:
            if category.lower() == 'uncategorized':
                # Filter for ideas with no category (null category_id)
                query = query.filter(Idea.category_id.is_(None))
            else:
                cat = Category.query.filter_by(name=category).first()
                if cat:
                    query = query.filter_by(category_id=cat.id)
        
        # Apply date range filters
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
                query = query.filter(Idea.created_at >= date_from_obj)
            except ValueError:
                pass  # Invalid date format, skip this filter
        
        if date_to:
            try:
                # Add one day to include the entire end date
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
                from datetime import timedelta
                date_to_obj = date_to_obj + timedelta(days=1)
                query = query.filter(Idea.created_at < date_to_obj)
            except ValueError:
                pass  # Invalid date format, skip this filter
        
        # Apply sorting
        if sort_by == 'views_desc':
            query = query.order_by(desc(Idea.view_count))
        elif sort_by == 'views_asc':
            query = query.order_by(Idea.view_count)
        elif sort_by == 'comments_desc':
            from models import Comment
            query = query.outerjoin(Comment).group_by(Idea.id).order_by(
                db.func.count(Comment.id).desc()
            )
        elif sort_by == 'comments_asc':
            from models import Comment
            query = query.outerjoin(Comment).group_by(Idea.id).order_by(
                db.func.count(Comment.id)
            )
        elif sort_by == 'oldest':
            query = query.order_by(Idea.created_at)
        else:  # recent (default)
            query = query.order_by(desc(Idea.created_at))
        
        # Paginate
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Process ideas to truncate descriptions
        ideas_list = []
        for idea in paginated.items:
            idea_dict = idea.to_dict()
            # Truncate and clean description
            idea_dict['description'] = IdeaController._truncate_description(idea.description, max_length=500)
            ideas_list.append(idea_dict)
        
        return {
            'ideas': ideas_list,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages,
            'filters': {
                'search_query': search_query,
                'category': category,
                'date_from': date_from,
                'date_to': date_to,
                'sort_by': sort_by
            }
        }, 200
    
    @staticmethod
    def get_available_categories():
        """Get unique active categories that are actually used in ideas, sorted by idea count (max to min)"""
        # Query to get distinct active categories from ideas table
        categories_query = db.session.query(Category).join(
            Idea, Idea.category_id == Category.id
        ).filter(
            Idea.is_active == True,
            Category.is_active == True
        ).distinct().all()
        
        categories_list = [cat.to_dict() for cat in categories_query]
        
        # Check if there are any uncategorized ideas (ideas with null category_id)
        uncategorized_count = Idea.query.filter(
            Idea.category_id.is_(None),
            Idea.is_active == True
        ).count()
        
        if uncategorized_count > 0:
            # Add "uncategorized" as a special category
            categories_list.append({
                'id': None,
                'name': 'uncategorized',
                'description': 'Ideas without a category',
                'idea_count': uncategorized_count
            })
        
        # Sort by idea_count in descending order (max to min)
        categories_list.sort(key=lambda x: x['idea_count'], reverse=True)
        
        return {
            'categories': categories_list,
            'total': len(categories_list)
        }, 200
    
    @staticmethod
    def get_my_ideas(user_id, page=1, per_page=20):
        """Get all ideas created by the authenticated user"""
        # Convert string ID to integer
        user_id = int(user_id)
        query = Idea.query.filter_by(user_id=user_id, is_active=True).order_by(desc(Idea.created_at))
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Process ideas to truncate descriptions
        ideas_list = []
        for idea in paginated.items:
            idea_dict = idea.to_dict()
            # Truncate and clean description
            idea_dict['description'] = IdeaController._truncate_description(idea.description, max_length=500)
            ideas_list.append(idea_dict)
        
        return {
            'ideas': ideas_list,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200
    
    @staticmethod
    def get_my_commented_ideas(user_id, page=1, per_page=20):
        """Get all ideas where the authenticated user has commented"""
        from models import Comment
        # Convert string ID to integer
        user_id = int(user_id)
        
        # Get distinct idea IDs where user has commented
        commented_idea_ids = db.session.query(Comment.idea_id).filter(
            Comment.user_id == user_id,
            Comment.is_active == True
        ).distinct().subquery()
        
        # Query ideas based on those IDs
        query = Idea.query.filter(
            Idea.id.in_(commented_idea_ids),
            Idea.is_active == True
        ).order_by(desc(Idea.updated_at))
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Process ideas to truncate descriptions
        ideas_list = []
        for idea in paginated.items:
            idea_dict = idea.to_dict()
            # Truncate and clean description
            idea_dict['description'] = IdeaController._truncate_description(idea.description, max_length=500)
            ideas_list.append(idea_dict)
        
        return {
            'ideas': ideas_list,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }, 200


