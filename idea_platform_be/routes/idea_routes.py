from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from controllers.idea_controller import IdeaController

idea_bp = Blueprint('ideas', __name__)

@idea_bp.route('/', methods=['POST'])
@jwt_required()
def create_idea():
    """Create a new idea"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('description'):
        return jsonify({'error': 'Title and description are required'}), 400
    
    title = data.get('title')
    description = data.get('description')
    category_name = data.get('category')
    
    result, status_code = IdeaController.create_idea(user_id, title, description, category_name)
    return jsonify(result), status_code


@idea_bp.route('/', methods=['GET'])
def get_all_ideas():
    """Get all ideas with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'recent')
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    result, status_code = IdeaController.get_all_ideas(page, per_page, category, search, sort_by)
    return jsonify(result), status_code


@idea_bp.route('/<int:idea_id>', methods=['GET'])
def get_idea(idea_id):
    """Get a specific idea and track view count"""
    # Try to get the viewer's ID if they're logged in (optional)
    viewer_id = None
    try:
        verify_jwt_in_request(optional=True)
        viewer_id = get_jwt_identity()
    except:
        pass  # Anonymous user
    
    result, status_code = IdeaController.get_idea(idea_id, viewer_id)
    return jsonify(result), status_code


@idea_bp.route('/<int:idea_id>', methods=['PUT'])
@jwt_required()
def update_idea(idea_id):
    """Update an idea"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    title = data.get('title')
    description = data.get('description')
    category_name = data.get('category')
    
    result, status_code = IdeaController.update_idea(idea_id, user_id, title, description, category_name)
    return jsonify(result), status_code


@idea_bp.route('/<int:idea_id>', methods=['DELETE'])
@jwt_required()
def delete_idea(idea_id):
    """Delete an idea"""
    user_id = get_jwt_identity()
    result, status_code = IdeaController.delete_idea(idea_id, user_id)
    return jsonify(result), status_code


@idea_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_ideas(user_id):
    """Get all ideas by a specific user"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = IdeaController.get_user_ideas(user_id, page, per_page)
    return jsonify(result), status_code


@idea_bp.route('/search', methods=['GET'])
def search_ideas():
    """
    Advanced search for ideas with multiple optional filters
    Query Parameters:
    - search: Search query for title/description
    - category: Filter by category name
    - date_from: Start date (YYYY-MM-DD)
    - date_to: End date (YYYY-MM-DD)
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 100)
    - sort_by: Sort by 'recent' or 'popular' (default: 'recent')
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search_query = request.args.get('search', type=str)
    category = request.args.get('category', type=str)
    date_from = request.args.get('date_from', type=str)
    date_to = request.args.get('date_to', type=str)
    sort_by = request.args.get('sort_by', 'recent', type=str)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    result, status_code = IdeaController.search_ideas(
        page=page,
        per_page=per_page,
        search_query=search_query,
        category=category,
        date_from=date_from,
        date_to=date_to,
        sort_by=sort_by
    )
    return jsonify(result), status_code


@idea_bp.route('/categories', methods=['GET'])
def get_available_categories():
    """Get all unique categories that are used in active ideas"""
    result, status_code = IdeaController.get_available_categories()
    return jsonify(result), status_code


@idea_bp.route('/my-ideas', methods=['GET'])
@jwt_required()
def get_my_ideas():
    """Get all ideas created by the authenticated user"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = IdeaController.get_my_ideas(user_id, page, per_page)
    return jsonify(result), status_code


@idea_bp.route('/my-commented-ideas', methods=['GET'])
@jwt_required()
def get_my_commented_ideas():
    """Get all ideas where the authenticated user has commented"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = IdeaController.get_my_commented_ideas(user_id, page, per_page)
    return jsonify(result), status_code

