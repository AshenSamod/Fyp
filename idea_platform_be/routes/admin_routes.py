from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.admin_controller import AdminController
from models import User

admin_bp = Blueprint('admin', __name__)

def admin_required():
    """Decorator to check if user is admin"""
    user_id = get_jwt_identity()
    # Convert string ID to integer
    user = User.query.get(int(user_id))
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    return None


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)
    
    Query Parameters:
        - page: Page number (default: 1)
        - per_page: Items per page (default: 50, max: 100)
        - type: Filter by user type - 'admins' or 'users' (optional)
    """
    error = admin_required()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    user_type = request.args.get('type', type=str)
    per_page = min(per_page, 100)
    
    # Validate user_type if provided
    if user_type and user_type not in ['admins', 'users']:
        return jsonify({'error': 'Invalid user type. Must be "admins" or "users"'}), 400
    
    result, status_code = AdminController.get_all_users(page, per_page, user_type)
    return jsonify(result), status_code


@admin_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    """Search users by name or email (admin only)
    
    Query Parameters:
        - q: Search query string (required)
        - page: Page number (default: 1)
        - per_page: Items per page (default: 50, max: 100)
        - type: Filter by user type - 'admins' or 'users' (optional)
    """
    error = admin_required()
    if error:
        return error
    
    query = request.args.get('q', type=str)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    user_type = request.args.get('type', type=str)
    per_page = min(per_page, 100)
    
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    # Validate user_type if provided
    if user_type and user_type not in ['admins', 'users']:
        return jsonify({'error': 'Invalid user type. Must be "admins" or "users"'}), 400
    
    result, status_code = AdminController.search_users(query, page, per_page, user_type)
    return jsonify(result), status_code


@admin_bp.route('/users/<int:user_id>/make-admin', methods=['POST'])
@jwt_required()
def make_user_admin(user_id):
    """Grant admin privileges to a user (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.make_user_admin(user_id)
    return jsonify(result), status_code


@admin_bp.route('/users/<int:user_id>/remove-admin', methods=['POST'])
@jwt_required()
def remove_user_admin(user_id):
    """Remove admin privileges from a user (admin only)"""
    error = admin_required()
    if error:
        return error
    
    current_admin_id = get_jwt_identity()
    result, status_code = AdminController.remove_user_admin(user_id, current_admin_id)
    return jsonify(result), status_code


@admin_bp.route('/users/<int:user_id>/disable', methods=['POST'])
@jwt_required()
def disable_user(user_id):
    """Disable a user (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.disable_user(user_id)
    return jsonify(result), status_code


@admin_bp.route('/users/<int:user_id>/enable', methods=['POST'])
@jwt_required()
def enable_user(user_id):
    """Enable a user (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.enable_user(user_id)
    return jsonify(result), status_code


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.delete_user(user_id)
    return jsonify(result), status_code


@admin_bp.route('/ideas/<int:idea_id>', methods=['DELETE'])
@jwt_required()
def delete_idea(idea_id):
    """Delete an idea (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.delete_idea(idea_id)
    return jsonify(result), status_code


@admin_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.delete_comment(comment_id)
    return jsonify(result), status_code


@admin_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    """Get platform statistics (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.get_statistics()
    return jsonify(result), status_code


@admin_bp.route('/ideas/<int:idea_id>/category', methods=['PUT'])
@jwt_required()
def update_idea_category(idea_id):
    """Update idea category (admin only, for ML feedback)"""
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    if not data or not data.get('category'):
        return jsonify({'error': 'Category is required'}), 400
    
    category_name = data.get('category')
    
    result, status_code = AdminController.update_idea_category(idea_id, category_name)
    return jsonify(result), status_code


@admin_bp.route('/reports/ideas', methods=['GET'])
@jwt_required()
def get_flagged_ideas():
    """Get flagged ideas sorted by most reported (admin only)"""
    error = admin_required()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', 'pending', type=str)
    per_page = min(per_page, 100)
    
    result, status_code = AdminController.get_flagged_ideas(page, per_page, status)
    return jsonify(result), status_code


@admin_bp.route('/reports/comments', methods=['GET'])
@jwt_required()
def get_flagged_comments():
    """Get flagged comments sorted by most reported (admin only)"""
    error = admin_required()
    if error:
        return error
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', 'pending', type=str)
    per_page = min(per_page, 100)
    
    result, status_code = AdminController.get_flagged_comments(page, per_page, status)
    return jsonify(result), status_code


@admin_bp.route('/reports/<string:flag_type>/<int:flag_id>/status', methods=['PUT'])
@jwt_required()
def update_flag_status(flag_type, flag_id):
    """Update the status of a specific flag (admin only)"""
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    if not data or not data.get('status'):
        return jsonify({'error': 'Status is required'}), 400
    
    status = data.get('status')
    admin_id = get_jwt_identity()
    
    result, status_code = AdminController.update_flag_status(flag_type, flag_id, status, admin_id)
    return jsonify(result), status_code


@admin_bp.route('/reports/<string:content_type>/<int:content_id>/status', methods=['PUT'])
@jwt_required()
def update_all_flags_for_content(content_type, content_id):
    """Update all flags for a specific idea or comment (admin only)"""
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    if not data or not data.get('status'):
        return jsonify({'error': 'Status is required'}), 400
    
    status = data.get('status')
    admin_id = get_jwt_identity()
    
    result, status_code = AdminController.update_all_flags_for_content(content_type, content_id, status, admin_id)
    return jsonify(result), status_code


@admin_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_all_categories():
    """Get all categories (admin only)"""
    error = admin_required()
    if error:
        return error
    
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    result, status_code = AdminController.get_all_categories(include_inactive)
    return jsonify(result), status_code


@admin_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """Create a new category (admin only)"""
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Category name is required'}), 400
    
    name = data.get('name')
    description = data.get('description')
    
    result, status_code = AdminController.create_category(name, description)
    return jsonify(result), status_code


@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update a category (admin only)"""
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Request body is required'}), 400
    
    name = data.get('name')
    description = data.get('description')
    
    result, status_code = AdminController.update_category(category_id, name, description)
    return jsonify(result), status_code


@admin_bp.route('/categories/<int:category_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_category_status(category_id):
    """Toggle category active/inactive status (admin only)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.toggle_category_status(category_id)
    return jsonify(result), status_code


@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete a category (admin only - only if no ideas are using it)"""
    error = admin_required()
    if error:
        return error
    
    result, status_code = AdminController.delete_category(category_id)
    return jsonify(result), status_code
