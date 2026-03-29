import os
import warnings

# Suppress TensorFlow warnings before importing
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Filter deprecation warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning)

try:
    import tensorflow as tf
    import tensorflow_hub as hub
    import numpy as np
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("WARNING: TensorFlow not installed. ML categorization will use fallback method.")
    print("To enable ML: pip install tensorflow tensorflow-hub")

from config import Config

class MLCategorizationService:
    """
    Service for categorizing ideas using the ELMo pre-trained model.
    Singleton pattern to avoid reloading the model multiple times.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLCategorizationService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            if not TENSORFLOW_AVAILABLE:
                print("ML Categorization Service: Using fallback mode (TensorFlow not available)")
                self._initialized = True
                return
            
            print("Initializing ML Categorization Service...")
            try:
                # Try to load local model first, then fall back to remote
                local_model_path = Config.ML_MODEL_PATH
                
                # Check if local model exists
                import os
                if os.path.exists(local_model_path):
                    print(f"Loading local ELMo model from: {local_model_path}")
                    self.embedding = hub.load(local_model_path)
                else:
                    print("Local model not found. Downloading ELMo model from TensorFlow Hub...")
                    print("This is a one-time download (~400MB)")
                    # Model will be cached locally after first download
                    self.embedding = hub.load("https://tfhub.dev/google/elmo/3")
                
                self._initialized = True
                print("ML Categorization Service initialized successfully!")
            except Exception as e:
                print(f"Warning: Could not load ML model: {e}")
                print("Falling back to keyword-based categorization")
                self.embedding = None
                self._initialized = True
    
    def _get_active_categories(self):
        """Fetch active categories from database, fallback to config if DB not available"""
        try:
            from models import Category
            active_categories = Category.query.filter_by(is_active=True).all()
            if active_categories:
                return [cat.name for cat in active_categories]
        except Exception as e:
            print(f"Could not fetch categories from DB: {e}. Using config fallback.")
        return Config.DEFAULT_CATEGORIES
    
    def find_category(self, idea_text, categories_list=None):
        """
        Find the best matching category for an idea using ML model.
        Falls back to keyword-based matching if TensorFlow is not available.
        
        :param idea_text: The text of the idea to categorize
        :param categories_list: Optional list of categories (fetches from DB if not provided)
        :return: Dictionary with 'result' (best category) and 'category_scores' (all scores)
        """
        if categories_list is None:
            categories_list = self._get_active_categories()
        
        # Fallback to keyword-based categorization if TensorFlow not available
        if not TENSORFLOW_AVAILABLE or not hasattr(self, 'embedding') or self.embedding is None:
            return self._fallback_categorization(idea_text, categories_list)
        
        try:
            # Prepare variables
            categories_list_local = list(categories_list)
            categories_list_local.append(idea_text)
            num_categories = len(categories_list)
            
            # Compute embeddings using TensorFlow 2.x
            embeddings = self.embedding(categories_list_local)
            message_embeddings_ = embeddings.numpy()
            
            categories_dict = {}
            
            # Calculate similarity scores for each category
            for i, category in enumerate(categories_list):
                score = np.inner(message_embeddings_[num_categories], message_embeddings_[i])
                categories_dict[category] = float(score)  # Convert to float for JSON serialization
            
            # Find the best matching category
            best_category = max(categories_dict, key=categories_dict.get)
            
            return {
                "result": best_category, 
                "category_scores": categories_dict
            }
        except Exception as e:
            print(f"Error in ML categorization: {e}. Using fallback method.")
            return self._fallback_categorization(idea_text, categories_list)
    
    def _fallback_categorization(self, idea_text, categories_list):
        """
        Fallback keyword-based categorization when ML is not available.
        
        :param idea_text: The text to categorize
        :param categories_list: List of categories
        :return: Dictionary with 'result' and 'category_scores'
        """
        text_lower = idea_text.lower()
        
        # Define keywords for each category
        category_keywords = {
            "carsharing": ["car", "ride", "sharing", "vehicle", "transport", "driver", "uber", "taxi", "carpooling"],
            "medical": ["medical", "health", "doctor", "hospital", "patient", "disease", "cure", "medicine", "healthcare", "diagnosis", "treatment"],
            "education": ["education", "learning", "student", "teacher", "school", "university", "course", "tutor", "training", "study"],
            "agriculture": ["agriculture", "farm", "crop", "plant", "soil", "harvest", "farming", "pesticide", "irrigation", "organic"],
            "software": ["software", "app", "program", "code", "system", "technology", "computer", "digital", "operating", "web", "mobile"],
            "hardware": ["hardware", "device", "gadget", "electronics", "circuit", "chip", "processor", "sensor", "iot", "physical"],
            "finance": ["finance", "banking", "payment", "money", "investment", "trading", "fintech", "cryptocurrency", "loan", "credit"],
            "entertainment": ["entertainment", "game", "gaming", "movie", "music", "video", "streaming", "media", "fun", "social"],
            "environment": ["environment", "green", "sustainable", "eco", "renewable", "climate", "pollution", "recycling", "conservation", "carbon"],
            "transportation": ["transportation", "logistics", "delivery", "shipping", "freight", "supply chain", "warehouse", "distribution", "fleet"]
        }
        
        categories_dict = {}
        
        # Calculate scores based on keyword matches
        for category in categories_list:
            score = 0
            keywords = category_keywords.get(category, [category])
            for keyword in keywords:
                if keyword in text_lower:
                    score += 10
            categories_dict[category] = float(score)
        
        # If no keywords matched, assign random small scores
        if all(score == 0 for score in categories_dict.values()):
            import random
            for category in categories_list:
                categories_dict[category] = float(random.uniform(1, 5))
        
        # Find the best matching category
        best_category = max(categories_dict, key=categories_dict.get)
        
        return {
            "result": best_category,
            "category_scores": categories_dict
        }
    
    def categorize_idea(self, idea_text):
        """
        Simplified method to categorize an idea and return just the category name.
        
        :param idea_text: The text of the idea to categorize
        :return: The name of the best matching category
        """
        result = self.find_category(idea_text)
        return result["result"]
    
    def get_available_categories(self):
        """
        Get the list of available categories.
        
        :return: List of category names
        """
        return self.categories_list
    
    def update_categories(self, new_categories):
        """
        Update the list of available categories.
        
        :param new_categories: New list of category names
        """
        self.categories_list = new_categories

# Create a singleton instance
ml_service = MLCategorizationService()
