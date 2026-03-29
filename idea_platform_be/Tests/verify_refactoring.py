"""
Verification Script
Tests the refactored models structure
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all models can be imported"""
    print("Testing model imports...")
    try:
        from models import User, Idea, Comment, Category, Like
        print("✓ All models imported successfully")
        print(f"  - User: {User.__name__}")
        print(f"  - Idea: {Idea.__name__}")
        print(f"  - Comment: {Comment.__name__}")
        print(f"  - Category: {Category.__name__}")
        print(f"  - Like: {Like.__name__}")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False


def test_model_structure():
    """Test that models have expected attributes"""
    print("\nTesting model structure...")
    try:
        from models import User, Idea, Comment, Category, Like
        
        # Check User model
        assert hasattr(User, '__tablename__')
        assert hasattr(User, 'to_dict')
        print("✓ User model structure valid")
        
        # Check Idea model
        assert hasattr(Idea, '__tablename__')
        assert hasattr(Idea, 'to_dict')
        print("✓ Idea model structure valid")
        
        # Check Comment model
        assert hasattr(Comment, '__tablename__')
        assert hasattr(Comment, 'to_dict')
        print("✓ Comment model structure valid")
        
        # Check Category model
        assert hasattr(Category, '__tablename__')
        assert hasattr(Category, 'to_dict')
        print("✓ Category model structure valid")
        
        # Check Like model
        assert hasattr(Like, '__tablename__')
        assert hasattr(Like, 'to_dict')
        print("✓ Like model structure valid")
        
        return True
    except Exception as e:
        print(f"✗ Structure test failed: {e}")
        return False


def test_controllers():
    """Test that controllers can import models"""
    print("\nTesting controller imports...")
    try:
        from controllers.auth_controller import AuthController
        print("✓ AuthController imports successfully")
        
        from controllers.idea_controller import IdeaController
        print("✓ IdeaController imports successfully")
        
        from controllers.comment_controller import CommentController
        print("✓ CommentController imports successfully")
        
        from controllers.engagement_controller import EngagementController
        print("✓ EngagementController imports successfully")
        
        from controllers.admin_controller import AdminController
        print("✓ AdminController imports successfully")
        
        return True
    except Exception as e:
        print(f"✗ Controller import failed: {e}")
        return False


def main():
    """Run all verification tests"""
    print("="*60)
    print("Model Refactoring Verification")
    print("="*60)
    
    results = []
    
    # Test 1: Model imports
    results.append(("Model Imports", test_imports()))
    
    # Test 2: Model structure
    results.append(("Model Structure", test_model_structure()))
    
    # Test 3: Controller imports
    results.append(("Controller Imports", test_controllers()))
    
    # Summary
    print("\n" + "="*60)
    print("Verification Summary")
    print("="*60)
    
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    
    print("="*60)
    if all_passed:
        print("✓ All tests passed! Refactoring successful.")
        print("\nNext steps:")
        print("  1. Run: python app.py")
        print("  2. Test API endpoints")
        print("  3. Run migrations if needed")
    else:
        print("✗ Some tests failed. Please review errors above.")
    
    return all_passed


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
