from flask import Flask, render_template
from flask_cors import CORS
from routes.main import main
from db.db import db

app = Flask(__name__)
CORS(app)
app.config.from_object('config.Config')

db.init_app(app)

app.register_blueprint(main, url_prefix='/api/main')

@app.errorhandler(404)
def not_found(error):
    return "404 error", 404

@app.errorhandler(401)
def not_found(error):
    return "Not Authenticated", 401

@app.errorhandler(500)
def server_error(e):
  return 'An internal error occurred [main.py] %s' % e, 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
