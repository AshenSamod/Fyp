"""
Database Migration Manager
Simple command to run all database migrations
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from migrations.run_migrations import run_all_migrations

if __name__ == '__main__':
    # Check for command line arguments
    auto_yes = '--yes' in sys.argv or '-y' in sys.argv
    
    print("="*60)
    print("       Database Migration Manager")
    print("="*60)
    
    success = run_all_migrations(auto_yes=auto_yes, verbose=True)
    
    if success:
        print("\n✓ All migrations completed successfully!")
    else:
        print("\n✗ Some migrations failed. Please check the errors above.")
    
    sys.exit(0 if success else 1)
