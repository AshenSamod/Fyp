from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields (username is now optional, email is required)
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    username = data.get('username')  # Optional
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    role = data.get('role', 'idea_creator')  # Optional, defaults to 'idea_creator'
    
    result, status_code = AuthController.register_user(username, email, password, full_name, role)
    return jsonify(result), status_code


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user via email"""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    email = data.get('email')
    password = data.get('password')

    result, status_code = AuthController.login_user(email, password)
    return jsonify(result), status_code


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    print("Getting user profile")
    """Get current user profile"""
    user_id = get_jwt_identity()
    result, status_code = AuthController.get_user_profile(user_id)
    return jsonify(result), status_code


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    full_name = data.get('full_name')
    bio = data.get('bio')
    email = data.get('email')
    
    result, status_code = AuthController.update_user_profile(user_id, full_name, bio, email)
    return jsonify(result), status_code


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    result, status_code = AuthController.refresh_access_token(user_id)
    return jsonify(result), status_code


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Old password and new password are required'}), 400
    
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    result, status_code = AuthController.change_password(user_id, old_password, new_password)
    return jsonify(result), status_code


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user and blacklist the current token
    """
    from models.token_blacklist import TokenBlacklist
    from datetime import datetime, timedelta
    from flask import current_app
    
    jwt_data = get_jwt()
    jti = jwt_data['jti']
    user_id = get_jwt_identity()
    
    # Calculate token expiration time
    expires_delta = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', timedelta(hours=1))
    expires_at = datetime.utcnow() + expires_delta
    
    # Add token to blacklist
    try:
        TokenBlacklist.add_token_to_blacklist(
            jti=jti,
            user_id=int(user_id),
            token_type='access',
            expires_at=expires_at,
            reason='logout'
        )
        return jsonify({'message': 'Logged out successfully. Token has been revoked.'}), 200
    except Exception as e:
        return jsonify({'message': 'Logged out successfully.', 'note': 'Token already revoked or expired.'}), 200


@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_own_account():
    """
    Delete user's own account (soft delete)
    This will also soft delete all their ideas and comments
    Requires password confirmation for security
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('password'):
        return jsonify({'error': 'Password is required to delete account'}), 400
    
    password = data.get('password')
    
    result, status_code = AuthController.delete_own_account(user_id, password)
    return jsonify(result), status_code
