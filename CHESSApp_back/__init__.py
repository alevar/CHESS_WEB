from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('CHESSApp_back.flaskconfig')
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)