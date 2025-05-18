from flask import Flask
from flask_cors import CORS
import os
import sys

# Add better error tracing
def trace_calls(frame, event, arg):
    if event != 'call':
        return
    co = frame.f_code
    func_name = co.co_name
    if func_name == 'write':
        return
    func_line_no = frame.f_lineno
    func_filename = co.co_filename
    if not 'site-packages' in func_filename:  # Only trace our code
        print(f'Call to {func_name} on line {func_line_no} in {func_filename}')
    return

# Uncomment this line to enable detailed tracing
# sys.settrace(trace_calls)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Debugging info
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

try:
    from database.db import create_database_tables
    print("Successfully imported database module")
except ImportError as e:
    print(f"Error importing database: {e}")
    sys.exit(1)

# Route imports
try:
    import routes.auth_routes as auth_routes
    import routes.user_routes as user_routes
    import routes.face_routes as face_routes
    
    # Register routes
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(face_routes.bp)
    print("Successfully registered route blueprints")
except ImportError as e:
    print(f"Error importing routes: {e}")
    import traceback
    traceback.print_exc()

# For compatibility with old routes
@app.route('/signup', methods=['POST'])
def signup_compat():
    from routes.auth_routes import signup
    return signup()

@app.route('/login', methods=['POST'])
def login_compat():
    from routes.auth_routes import login
    return login()

@app.route('/')
def index():
    return {"message": "FRS Backend API is running!"}

if __name__ == '__main__':
    try:
        print("Initializing database and creating tables if they don't exist...")
        create_database_tables()
        print("Starting Flask development server...")
        app.run(debug=True, port=5000)
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()