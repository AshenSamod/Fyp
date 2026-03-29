from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.engagement_controller import EngagementController

engagement_bp = Blueprint('engagement', __name__)

@engagement_bp.route('/like', methods=['POST'])
@jwt_required()
def like_idea():
    """Like an idea"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('idea_id'):
        return jsonify({'error': 'Idea ID is required'}), 400
    
    idea_id = data.get('idea_id')
    
    result, status_code = EngagementController.like_idea(user_id, idea_id)
    return jsonify(result), status_code


@engagement_bp.route('/unlike', methods=['POST'])
@jwt_required()
def unlike_idea():
    """Unlike an idea"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('idea_id'):
        return jsonify({'error': 'Idea ID is required'}), 400
    
    idea_id = data.get('idea_id')
    
    result, status_code = EngagementController.unlike_idea(user_id, idea_id)
    return jsonify(result), status_code


@engagement_bp.route('/likes/<int:idea_id>', methods=['GET'])
def get_idea_likes(idea_id):
    """Get all likes for an idea"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = EngagementController.get_idea_likes(idea_id, page, per_page)
    return jsonify(result), status_code


@engagement_bp.route('/check-like/<int:idea_id>', methods=['GET'])
@jwt_required()
def check_user_like(idea_id):
    """Check if current user has liked an idea"""
    user_id = get_jwt_identity()
    result, status_code = EngagementController.check_user_like(user_id, idea_id)
    return jsonify(result), status_code


@engagement_bp.route('/my-likes', methods=['GET'])
@jwt_required()
def get_my_liked_ideas():
    """Get all ideas liked by current user"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = EngagementController.get_user_liked_ideas(user_id, page, per_page)
    return jsonify(result), status_code
