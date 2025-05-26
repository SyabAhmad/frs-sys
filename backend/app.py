from flask import Flask
from flask_cors import CORS
import os

# Import blueprints
from auth import auth_bp
from routes.people import people_bp
from routes.scan import scan_bp

# Create Flask app
app = Flask(__name__)
CORS(app)  # This will allow requests from your frontend

# Set upload folder configuration
from config import UPLOAD_FOLDER
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(people_bp)
app.register_blueprint(scan_bp)

if __name__ == '__main__':
    if not os.getenv('DB_PASSWORD'):
        print("WARNING: DB_PASSWORD environment variable is not set.")
    
    # Note: Your frontend is trying to reach http://localhost:8000
    # This Flask app runs on port 5000 by default.
    app.run(debug=True, port=5000)