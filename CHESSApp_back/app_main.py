from flask import Flask, render_template
from routes.main_routes import main_bp
from db.db import db
from config import Config
from middleware import setup_cors

app = Flask(__name__)
app.config.from_object(Config)

# Setup middleware
setup_cors(app, app_type='main')

db.init_app(app)

# Register only main routes (read-only)
app.register_blueprint(main_bp, url_prefix='/api/main')

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return "404 error", 404

@app.errorhandler(500)
def server_error(e):
    return 'An internal error occurred [app_main.py] %s' % e, 500

# ============================================================================
# MAIN ROUTES
# ============================================================================

@app.route('/')
def index():
    """Serve the main application"""
    return render_template('index.html')

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'CHESS Web App - Main (Read-Only)'}

@app.route('/middleware/stats')
def middleware_stats():
    """Get middleware statistics"""
    return {
        'cors': 'enabled',
        'app_type': 'main',
        'message': 'Simplified middleware - CORS only'
    }

if __name__ == '__main__':
    print("🚀 Starting CHESS Web App - Main (Read-Only) on port 5000")
    print("📖 This application provides read-only access to the database")
    print("🌐 Access the main frontend at: http://localhost:5000")
    app.run(host="0.0.0.0", port=5000) 