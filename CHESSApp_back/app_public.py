from flask import Flask, render_template
from routes.public_routes import public_bp
from db.db import db
from config import Config
from middleware import setup_cors

app = Flask(__name__)
app.config.from_object(Config)

# Setup middleware
setup_cors(app, app_type='public')

db.init_app(app)

# Register only public routes (read-only)
app.register_blueprint(public_bp, url_prefix='/api/public')

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return "404 error", 404

@app.errorhandler(500)
def server_error(e):
    return 'An internal error occurred [app_public.py] %s' % e, 500

# ============================================================================
# MAIN ROUTES
# ============================================================================

@app.route('/')
def index():
    """Serve the public application"""
    return render_template('index.html')

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'CHESS Web App - public (Read-Only)'}

@app.route('/middleware/stats')
def middleware_stats():
    """Get middleware statistics"""
    return {
        'cors': 'enabled',
        'app_type': 'public',
        'message': 'Simplified middleware - CORS only'
    }

if __name__ == '__main__':
    import argparse
    import os
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='CHESS Web App - Public Interface')
    parser.add_argument('--port', '-p', type=int, default=None,
                       help='Port to run the public server on (default: 5000)')
    parser.add_argument('--host', type=str, default="0.0.0.0",
                       help='Host to bind to (default: 0.0.0.0 for external access)')
    args = parser.parse_args()
    
    # Determine port: command line > environment variable > default
    port = args.port or int(os.environ.get('CHESS_PUBLIC_PORT', 5000))
    host = args.host or os.environ.get('CHESS_PUBLIC_HOST', '0.0.0.0')
    
    print(f"🚀 Starting CHESS Web App - Public (Read-Only) on {host}:{port}")
    print("📖 This application provides read-only access to the database")
    print(f"🌐 Access the public frontend at: http://{host}:{port}")
    
    app.run(host=host, port=port, debug=True) 