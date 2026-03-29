"""
Initialization script to set up the database and create default categories.
Run this script once to initialize the database.
"""
from app import create_app
from extensions import db
from models import Category, User
from extensions import bcrypt

def init_db():
    """Initialize the database with default data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully!")
        
        # Create default categories
        print("\nCreating default categories...")
        default_categories = [
            {"name": "carsharing", "description": "Ideas related to vehicle sharing and ride-sharing services"},
            {"name": "medical", "description": "Healthcare and medical innovations"},
            {"name": "education", "description": "Educational technology and learning solutions"},
            {"name": "agriculture", "description": "Agricultural innovations and farming solutions"},
            {"name": "software", "description": "Software development and technology solutions"},
            {"name": "hardware", "description": "Hardware innovations and physical product designs"},
            {"name": "finance", "description": "Financial technology and services"},
            {"name": "entertainment", "description": "Entertainment, gaming, and media innovations"},
            {"name": "environment", "description": "Environmental sustainability and green technology"},
            {"name": "transportation", "description": "Transportation infrastructure and logistics"}
        ]
        
        for cat_data in default_categories:
            existing = Category.query.filter_by(name=cat_data['name']).first()
            if not existing:
                category = Category(
                    name=cat_data['name'],
                    description=cat_data['description'],
                    is_active=True
                )
                db.session.add(category)
                print(f"  ✓ Created category: {cat_data['name']}")
            else:
                print(f"  - Category already exists: {cat_data['name']}")
        
        db.session.commit()
        print("\n✓ Default categories created successfully!")
        
        # Create default admin user
        print("\nCreating default admin user...")
        admin_username = "admin"
        existing_admin = User.query.filter_by(username=admin_username).first()
        
        if not existing_admin:
            admin_password = "admin123"  # Change this in production!
            password_hash = bcrypt.generate_password_hash(admin_password).decode('utf-8')
            
            admin_user = User(
                username=admin_username,
                email="admin@ideasplatform.com",
                password_hash=password_hash,
                full_name="Platform Administrator",
                role="idea_creator",
                is_admin=True,
                is_active=True
            )
            db.session.add(admin_user)
            db.session.commit()
            print(f"  ✓ Admin user created!")
            print(f"    Username: {admin_username}")
            print(f"    Password: {admin_password}")
            print(f"    ⚠️  IMPORTANT: Change the admin password after first login!")
        else:
            print(f"  - Admin user already exists")
        
        print("\n" + "="*50)
        print("Database initialization completed successfully!")
        print("="*50)

if __name__ == '__main__':
    init_db()
