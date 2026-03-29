"""
Report Routes
Handles user reporting of ideas and comments
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.report_controller import ReportController

report_bp = Blueprint('report', __name__)


@report_bp.route('/idea/<int:idea_id>', methods=['POST'])
@jwt_required()
def report_idea(idea_id):
    """Report an idea"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('reason'):
        return jsonify({'error': 'Reason is required'}), 400
    
    reason = data.get('reason')
    description = data.get('description')
    
    result, status_code = ReportController.report_idea(idea_id, user_id, reason, description)
    return jsonify(result), status_code


@report_bp.route('/comment/<int:comment_id>', methods=['POST'])
@jwt_required()
def report_comment(comment_id):
    """Report a comment"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('reason'):
        return jsonify({'error': 'Reason is required'}), 400
    
    reason = data.get('reason')
    description = data.get('description')
    
    result, status_code = ReportController.report_comment(comment_id, user_id, reason, description)
    return jsonify(result), status_code


@report_bp.route('/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    """Get all reports submitted by the current user"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)
    
    result, status_code = ReportController.get_my_reports(user_id, page, per_page)
    return jsonify(result), status_code
