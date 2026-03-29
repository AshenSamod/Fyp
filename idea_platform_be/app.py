import os
import warnings
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Suppress TensorFlow warnings and info messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # 0=all, 1=info, 2=warning, 3=error
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN custom operations messages

# Filter out specific deprecation warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning, module='tensorflow_hub')
warnings.filterwarnings('ignore', message='.*pkg_resources.*')

# Suppress TensorFlow logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)

from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt, migrate, bcrypt

# Import all models to ensure they are registered with SQLAlchemy
import models

from routes.auth_routes import auth_bp
from routes.idea_routes import idea_bp
from routes.comment_routes import comment_bp
from routes.admin_routes import admin_bp
from routes.engagement_routes import engagement_bp
from routes.report_routes import report_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Disable strict slashes to handle both /api/comments and /api/comments/
    app.url_map.strict_slashes = False
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    
    # Configure CORS with frontend URL from config
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # JWT Configuration - Allow any type for identity
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return identity
    
    # JWT Token blacklist checker
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        from models.token_blacklist import TokenBlacklist
        from models.user import User
        
        jti = jwt_payload["jti"]
        user_id = jwt_payload.get("sub")
        
        # Check if token is explicitly blacklisted
        if TokenBlacklist.is_jti_blacklisted(jti):
            return True
        
        # Check if user is disabled/inactive
        if user_id:
            try:
                user_id_int = int(user_id)
                user = User.query.get(user_id_int)
                if user and not user.is_active:
                    return True
            except (ValueError, TypeError):
                pass
        
        return False
    
    # Custom response for revoked tokens
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        from models.user import User
        user_id = jwt_payload.get("sub")
        
        # Check if it's because user is disabled
        if user_id:
            try:
                user_id_int = int(user_id)
                user = User.query.get(user_id_int)
                if user and not user.is_active:
                    return {
                        'error': 'User account has been disabled',
                        'message': 'Your account has been disabled by an administrator'
                    }, 401
            except (ValueError, TypeError):
                pass
        
        return {
            'error': 'Token has been revoked',
            'message': 'The token has been revoked. Please login again.'
        }, 401
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(idea_bp, url_prefix='/api/ideas')
    app.register_blueprint(comment_bp, url_prefix='/api/comments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(engagement_bp, url_prefix='/api/engagement')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def index():
        return {'message': 'Idea Sharing Platform API', 'status': 'running'}
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    host = app.config.get('SERVER_HOST', '0.0.0.0')
    port = app.config.get('SERVER_PORT', 5000)
    debug = app.config.get('DEBUG', True)
    app.run(debug=debug, host=host, port=port)
