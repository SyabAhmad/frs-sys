from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from database import init_db
from routes import register_routes
import logging
import sys
from datetime import timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

# Load environment variables from .env file
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Enhanced CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # JWT Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    
    try:
        # Initialize the database
        logging.info("Initializing database...")
        init_db(app)
        logging.info("Database initialization complete")
        
        # Register routes
        register_routes(app)
        logging.info("Routes registered")
        
    except Exception as e:
        logging.error(f"Application setup failed: {str(e)}")
        sys.exit(1)
    
    @app.route('/api/health-check')
    def health_check():
        return {
            'status': 'healthy',
            'message': 'Face Recognition System API is running!',
            'services': {
                'database': 'connected',
                'qdrant': 'initialized' if os.environ.get('QDRANT_HOST') else 'not configured'
            }
        }, 200
    
    return app

if __name__ == '__main__':
    print("Starting Face Recognition System backend...")
    app = create_app()
    print(f"Server is running on http://0.0.0.0:5000")
    app.run(debug=os.environ.get('FLASK_DEBUG', 'True') == 'True', 
            host='0.0.0.0', 
            port=int(os.environ.get('PORT', 5000)))