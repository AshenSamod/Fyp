"""
Migration Runner
Utility to run database migrations
"""

import os
import sys
import importlib.util
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_migration_files():
    """Get all migration files in order"""
    migrations_dir = Path(__file__).parent
    migration_files = sorted([
        f for f in migrations_dir.glob('*.py')
        if f.name != '__init__.py' and f.name != 'run_migrations.py'
        and f.name.startswith(('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'))
    ])
    return migration_files


def run_migration(migration_file, verbose=True):
    """Run a single migration file"""
    if verbose:
        print(f"\n{'='*60}")
        print(f"Running migration: {migration_file.name}")
        print('='*60)
    
    # Import the migration module
    spec = importlib.util.spec_from_file_location("migration", migration_file)
    migration_module = importlib.util.module_from_spec(spec)
    
    try:
        spec.loader.exec_module(migration_module)
    except Exception as e:
        if verbose:
            print(f"✗ Error loading migration: {e}")
        return False
    
    # Look for the main function (could be 'migrate', 'migrate_*', or 'main')
    migration_func = None
    for attr_name in dir(migration_module):
        if attr_name.startswith('migrate') or attr_name == 'main':
            attr = getattr(migration_module, attr_name)
            if callable(attr) and not attr_name.startswith('_'):
                migration_func = attr
                break
    
    if migration_func:
        try:
            result = migration_func()
            return True
        except Exception as e:
            if verbose:
                print(f"✗ Error running migration: {e}")
            return False
    else:
        if verbose:
            print(f"✗ No migration function found in {migration_file.name}")
        return False


def run_all_migrations(auto_yes=False, verbose=True):
    """Run all pending migrations"""
    migration_files = get_migration_files()
    
    if not migration_files:
        print("✓ No migration files found. Database is up to date.")
        return True
    
    if verbose:
        print(f"\n{'='*60}")
        print("Database Migration Runner")
        print('='*60)
        print(f"\nFound {len(migration_files)} migration(s):")
        for mf in migration_files:
            print(f"  - {mf.name}")
    
    if not auto_yes:
        print("\n" + "="*60)
        response = input("Run all migrations? (yes/no): ").strip().lower()
        
        if response not in ['yes', 'y']:
            print("Migration cancelled.")
            return False
    
    success_count = 0
    failed_count = 0
    
    for migration_file in migration_files:
        if run_migration(migration_file, verbose=verbose):
            success_count += 1
        else:
            failed_count += 1
            if verbose:
                print(f"✗ Migration {migration_file.name} failed!")
    
    if verbose:
        print("\n" + "="*60)
        print("Migration Summary:")
        print(f"  ✓ Successful: {success_count}")
        if failed_count > 0:
            print(f"  ✗ Failed: {failed_count}")
        print("="*60)
    
    return failed_count == 0


def main():
    """Main entry point"""
    # Check for command line arguments
    auto_yes = '--yes' in sys.argv or '-y' in sys.argv
    quiet = '--quiet' in sys.argv or '-q' in sys.argv
    
    if '--help' in sys.argv or '-h' in sys.argv:
        print("Database Migration Runner")
        print("\nUsage:")
        print("  python migrations/run_migrations.py [OPTIONS]")
        print("\nOptions:")
        print("  -y, --yes     Skip confirmation prompt")
        print("  -q, --quiet   Reduce output verbosity")
        print("  -h, --help    Show this help message")
        print("\nExamples:")
        print("  python migrations/run_migrations.py")
        print("  python migrations/run_migrations.py --yes")
        print("  python migrations/run_migrations.py -y -q")
        return
    
    verbose = not quiet
    success = run_all_migrations(auto_yes=auto_yes, verbose=verbose)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
