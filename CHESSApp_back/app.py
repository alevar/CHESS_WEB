# main application file
# this file is the entry point for the CHESS Web App
# this file should not be modified unless you know what you are doing
# this file is responsible for starting the server and registering blueprints
# this file is responsible for handling errors
# this file is responsible for rendering the index.html template


from CHESSApp_back import models, app, db
from flask import jsonify, request, render_template

from CHESSApp_back.routes.main_routes import main_blueprint

# register blueprints
app.register_blueprint(main_blueprint, url_prefix='/api/main')

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
    app.run(port=5000)