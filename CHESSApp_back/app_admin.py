from flask import Flask, render_template
from routes.admin_routes import admin_bp
from routes.public_routes import public_bp
from db.db import db
from config import Config
from middleware import setup_cors

app = Flask(__name__)
app.config.from_object(Config)

# Setup middleware
setup_cors(app, app_type='admin')

# Configure file upload settings for admin operations
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
app.config['UPLOAD_TIMEOUT'] = Config.UPLOAD_TIMEOUT

db.init_app(app)

# Register only admin routes (full access)
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(public_bp, url_prefix='/api/public')

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return "404 error", 404

@app.errorhandler(500)
def server_error(e):
    return 'An internal error occurred [app_admin.py] %s' % e, 500

# ============================================================================
# ADMIN ROUTES
# ============================================================================

@app.route('/')
def admin_index():
    """Serve the admin application"""
    return render_template('admin.html')

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'CHESS Web App - Admin (Full Access)'}

@app.route('/middleware/stats')
def middleware_stats():
    """Get middleware statistics"""
    return {
        'cors': 'enabled',
        'app_type': 'admin',
        'message': 'Simplified middleware - CORS only'
    }

if __name__ == '__main__':
    print("🔧 Starting CHESS Web App - Admin (Full Access) on port 5001")
    print("⚠️  This application provides full database access - use only locally!")
    print("🔒 Access the admin dashboard at: http://localhost:5001")
    print("📝 Remember: This should NEVER be exposed to external users")
    app.run(host="127.0.0.1", port=5001)  # Only bind to localhost for security 