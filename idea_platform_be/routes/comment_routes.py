from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.comment_controller import CommentController

comment_bp = Blueprint('comments', __name__)

@comment_bp.route('/', methods=['POST'])
@jwt_required()
def create_comment():
    """Create a new comment"""
    user_id = get_jwt_identity()
    data = request.get_json()
    print("Received data for new comment:", data)
    
    if not data or not data.get('idea_id') or not data.get('content'):
        return jsonify({'error': 'Idea ID and content are required'}), 400
    
    idea_id = data.get('idea_id')
    content = data.get('content')
    parent_id = data.get('parent_id')
    
    result, status_code = CommentController.create_comment(user_id, idea_id, content, parent_id)
    return jsonify(result), status_code


@comment_bp.route('/idea/<int:idea_id>', methods=['GET'])
def get_idea_comments(idea_id):
    """Get all comments for an idea"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = CommentController.get_idea_comments(idea_id, page, per_page)
    return jsonify(result), status_code


@comment_bp.route('/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    """Update a comment"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
    
    content = data.get('content')
    
    result, status_code = CommentController.update_comment(comment_id, user_id, content)
    return jsonify(result), status_code


@comment_bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment"""
    user_id = get_jwt_identity()
    result, status_code = CommentController.delete_comment(comment_id, user_id)
    return jsonify(result), status_code
