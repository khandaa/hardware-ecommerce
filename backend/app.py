import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models.database import db
from api.products import product_bp
from api.auth import auth_bp
from api.cart import cart_bp
from api.orders import order_bp
from api.payment import payment_bp

# Load environment variables
load_dotenv()

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///../database/hardware_ecommerce.db'),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev'),
            RAZORPAY_KEY_ID=os.environ.get('RAZORPAY_KEY_ID'),
            RAZORPAY_KEY_SECRET=os.environ.get('RAZORPAY_KEY_SECRET')
        )
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Initialize extensions
    CORS(app)
    JWTManager(app)
    db.init_app(app)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Register blueprints
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')

    @app.route('/')
    def index():
        return jsonify({"message": "Welcome to Hardware E-commerce API"}), 200

    # Create database tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
