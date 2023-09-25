# Defines the database models for the CHESSApp_back Flask app
# Please put all database models in this file
# A database model is a class that represents a table in the database
# Please provide documentation for each database model
# Please provide a __repr__ method for each database model
# Please provide a comment for each database model that explains what it represents

from CHESSApp_back import db
from sqlalchemy.sql import text, func

from sqlalchemy.dialects.sqlite import *

# Current database is the direct adoptation of the gffutils database

class Feature(db.Model):
    __tablename__ = 'features'
    id = db.Column(db.Text, primary_key=True)
    seqid = db.Column(db.Text)
    source = db.Column(db.Text)
    featuretype = db.Column(db.Text)
    start = db.Column(db.Integer)
    end = db.Column(db.Integer)
    score = db.Column(db.Text)
    strand = db.Column(db.Text)
    frame = db.Column(db.Text)
    attributes = db.Column(db.Text)
    extra = db.Column(db.Text)
    bin = db.Column(db.Integer)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Relation(db.Model):
    __tablename__ = 'relations'
    parent = db.Column(db.Text, primary_key=True)
    child = db.Column(db.Text, primary_key=True)
    level = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Meta(db.Model):
    __tablename__ = 'meta'
    dialect = db.Column(db.Text, primary_key=True)
    version = db.Column(db.Text)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Directive(db.Model):
    __tablename__ = 'directives'
    directive = db.Column(db.Text, primary_key=True)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class AutoIncrement(db.Model):
    __tablename__ = 'autoincrements'
    base = db.Column(db.Text, primary_key=True)
    n = db.Column(db.Integer)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Duplicate(db.Model):
    __tablename__ = 'duplicates'
    idspecid = db.Column(db.Text, primary_key=True)
    newid = db.Column(db.Text)

    def __repr__(self):
        # return '<Project %r>' % (self.title)
        # formats/manually creates the JSON object
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}