# Fyp
A Flask-based REST API for an idea-sharing platform with ML-powered automatic categorization using Google's ELMo model.

##  Features

### Core Functionality
- **User Management**: Registration, login, profile management with JWT authentication
- **Idea Submission**: Submit, edit, and delete ideas with automatic ML categorization
- **ML Categorization**: Automatic idea categorization using a pre-trained ELMo model
- **Idea Discovery**: Browse, filter, and search ideas by category, keywords, or popularity
- **Engagement**: Comment on ideas, like/unlike functionality
- **Admin Panel**: User management, content moderation, platform statistics

### ML Features
- Automatic category prediction from idea descriptions
- Support for multiple categories: carsharing, medical, education, agriculture, software
- Category correction and feedback loop for model improvement
- Raw ML scores stored for analysis
