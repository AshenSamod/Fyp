# Idea Sharing Platform - Backend API

A Flask-based REST API for an idea sharing platform with ML-powered automatic categorization using Google's ELMo model.

##  Features

### Core Functionality
- **User Management**: Registration, login, profile management with JWT authentication
- **Idea Submission**: Submit, edit, and delete ideas with automatic ML categorization
- **ML Categorization**: Automatic idea categorization using pre-trained ELMo model
- **Idea Discovery**: Browse, filter, and search ideas by category, keywords, or popularity
- **Engagement**: Comment on ideas, like/unlike functionality
- **Admin Panel**: User management, content moderation, platform statistics

### ML Features
- Automatic category prediction from idea descriptions
- Support for multiple categories: carsharing, medical, education, agriculture, software
- Category correction and feedback loop for model improvement
- Raw ML scores stored for analysis

##  Prerequisites

- Python 3.8 to 3.12 (Python 3.13 has limited TensorFlow support on Windows)
- MySQL Server 5.7 or higher
- Git (for cloning the repository)
- **Microsoft Visual C++ Redistributable** (for TensorFlow ML features)
  - Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe

##  Quick Start Guide

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd idea_platform_be
```

### 2. Set Up Virtual Environment

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you encounter execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Set Up MySQL Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE idea_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user (optional but recommended)
CREATE USER 'idea_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON idea_platform_db.* TO 'idea_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Configure Environment Variables

```powershell
# Copy the example .env file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

Update `.env` with your configuration:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# Database Configuration
DATABASE_URL=mysql+pymysql://idea_user:your_password@localhost/idea_platform_db

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here

# ML Model Configuration
ML_MODEL_PATH=ml_models
```

### Download ML model 

Download the trained ELMo SavedModel and place it into the `ml_models` folder.

Notes:
- Requires `tensorflow` and `tensorflow-hub` installed in your virtual environment and an internet connection for the download.
- The saved model directory should contain `saved_model.pb` and a `variables/` subfolder.

### 6. Initialize the Database

```powershell
python init_db.py
```

This will:
- Create all database tables
- Set up default categories
- Create an admin user (username: `admin`, password: `admin123`)

### 7. Run Database Migrations (if needed)

If you have an existing database, run migrations to update the schema:

```powershell
# Run all migrations (interactive)
python migrate.py

# Or auto-confirm for CI/CD
python migrate.py --yes
```

### 8. Run the Application

```powershell
python app.py
```

The server will start at `http://localhost:5000`


## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /refresh` - Refresh access token

### Ideas (`/api/ideas`)
- `POST /` - Create new idea (requires auth)
- `GET /` - Get all ideas (supports filtering, search, pagination)
- `GET /:id` - Get specific idea
- `PUT /:id` - Update idea (requires auth, owner only)
- `DELETE /:id` - Delete idea (requires auth, owner only)
- `GET /user/:user_id` - Get user's ideas

### Comments (`/api/comments`)
- `POST /` - Create comment (requires auth)
- `GET /idea/:idea_id` - Get idea's comments
- `PUT /:id` - Update comment (requires auth, owner only)
- `DELETE /:id` - Delete comment (requires auth, owner only)

### Admin (`/api/admin`)
- `GET /users` - Get all users (admin only)
- `POST /users/:id/disable` - Disable user (admin only)
- `POST /users/:id/enable` - Enable user (admin only)
- `DELETE /users/:id` - Delete user (admin only)
- `DELETE /ideas/:id` - Delete idea (admin only)
- `DELETE /comments/:id` - Delete comment (admin only)
- `GET /statistics` - Get platform statistics (admin only)
- `PUT /ideas/:id/category` - Update idea category (admin only)


##  Default Admin Credentials

** IMPORTANT: Change these credentials immediately in production!**

- Username: `admin`
- Password: `admin123`
- Email: `admin@ideasplatform.com`

##  Machine Learning Model

The application uses Google's ELMo (Embeddings from Language Models) for automatic idea categorization.

### Default Categories
- **carsharing**: Vehicle sharing and ride-sharing services
- **medical**: Healthcare and medical innovations
- **education**: Educational technology and learning solutions
- **agriculture**: Agricultural innovations and farming solutions
- **software**: Software development and technology solutions

### How It Works
1. When an idea is submitted, the description is analyzed by the ELMo model
2. The model computes similarity scores against all categories
3. The category with the highest score is automatically assigned
4. Users and admins can correct categories for model improvement
5. Raw ML scores are stored for analysis and feedback

## Database Schema

### Users Table
- User authentication and profile information
- Admin role management
- Soft delete support

### Ideas Table
- Idea content (title, description)
- Category assignment
- ML scores and correction tracking
- Soft delete support

### Categories Table
- Category definitions
- Extensible for new categories

### Comments Table
- Nested comments support
- Soft delete support


##  Development

### Running in Development Mode

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Set Flask environment
$env:FLASK_ENV="development"

# Run the application
python app.py
```

### Database Migrations

```powershell
# Initialize migrations (first time only)
flask db init

# Create a migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade
```

### Adding New Categories

You can add new categories through the database or by modifying `config.py`:

```python
DEFAULT_CATEGORIES = [
    "carsharing", 
    "medical", 
    "education", 
    "agriculture", 
    "software",
    "your_new_category"  # Add here
]
```

Then update the database:
```sql
INSERT INTO categories (name, description) VALUES ('your_new_category', 'Description');
```

##  Troubleshooting

### Virtual Environment Issues

If you can't activate the virtual environment:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Connection Errors

1. Verify MySQL is running:
   ```powershell
   Get-Service MySQL*
   ```

2. Check database credentials in `.env`

3. Ensure database exists:
   ```sql
   SHOW DATABASES;
   ```

### ML Model Loading Issues

The ELMo model downloads automatically on first use. This requires:
- Internet connection
- Sufficient disk space (~400MB)
- Time for initial download (one-time only)

### TensorFlow DLL Load Failed (Windows)

If you see "DLL load failed" error with TensorFlow:

**Solution 1: Install Visual C++ Redistributable**
1. Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Install the redistributable
3. Restart your terminal and try again

**Solution 2: Use Python 3.11 or 3.12**
1. Uninstall Python 3.13
2. Install Python 3.11 or 3.12 from python.org
3. Recreate your virtual environment
4. Reinstall dependencies

**Temporary Workaround**: The application will run in fallback mode with keyword-based categorization if TensorFlow cannot load.

### Port Already in Use

Change the port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change to 5001 or any available port
```

##  Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key for sessions | `dev-secret-key-change-in-production` |
| `FLASK_ENV` | Flask environment | `development` |
| `DATABASE_URL` | MySQL connection string | `mysql+pymysql://root:password@localhost/idea_platform_db` |
| `JWT_SECRET_KEY` | JWT token secret | `jwt-secret-key-change-in-production` |
| `ML_MODEL_PATH` | Path for ML model cache | `ml_models` |

## 🔒 Security Considerations

### Production Deployment
1. **Change all default secrets** in `.env`
2. **Change admin password** immediately
3. Use **HTTPS** in production
4. Set `FLASK_ENV=production`
5. Use a proper **WSGI server** (gunicorn, uWSGI)
6. Enable **CORS** restrictions
7. Implement **rate limiting**
8. Use **environment variables** for all secrets

### JWT Tokens
- Access tokens expire in 1 hour
- Refresh tokens expire in 30 days
- Store tokens securely on client side

##  Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- [TensorFlow Hub - ELMo](https://tfhub.dev/google/elmo/3)

