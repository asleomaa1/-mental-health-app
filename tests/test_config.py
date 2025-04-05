from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

def get_test_app():
    """Create and configure app for testing"""
    app = Flask(__name__)
    app.config.update({
        'TESTING': True,
        'SECRET_KEY': 'test_secret_key',
        'SESSION_TYPE': 'filesystem',
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False
    })

    db = SQLAlchemy(app)

    # Create tables
    with app.app_context():
        db.create_all()

    # Register routes
    from server.routes import registerRoutes
    registerRoutes(app)

    return app