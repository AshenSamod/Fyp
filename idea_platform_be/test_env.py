"""
Quick test script to verify environment variables are loading correctly
"""
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

print("=" * 50)
print("Environment Variables Check")
print("=" * 50)

# Check database configuration
print(f"\nDB_HOST: {os.environ.get('DB_HOST', 'NOT SET')}")
print(f"DB_PORT: {os.environ.get('DB_PORT', 'NOT SET')}")
print(f"DB_USER: {os.environ.get('DB_USER', 'NOT SET')}")
print(f"DB_NAME: {os.environ.get('DB_NAME', 'NOT SET')}")
print(f"DB_PASSWORD: {'*' * len(os.environ.get('DB_PASSWORD', '')) if os.environ.get('DB_PASSWORD') else 'NOT SET'}")

# Check if database URI is correct
from config import Config
print(f"\nGenerated Database URI:")
print(f"{Config.SQLALCHEMY_DATABASE_URI}")

print("\n" + "=" * 50)
