from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.product import Product, ProductImage
import json

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    """Get all products with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category')
    
    query = Product.query
    
    if category:
        query = query.filter_by(category=category)
    
    products = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page
    }), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict()), 200

@product_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product (admin only)"""
    from models.user import User
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'description', 'price', 'stock', 'category', 'specifications']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Field {field} is required'}), 400
    
    # Convert specifications to JSON string if it's not already
    if isinstance(data['specifications'], dict):
        data['specifications'] = json.dumps(data['specifications'])
    
    # Create new product
    new_product = Product(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        stock=data['stock'],
        category=data['category'],
        specifications=data['specifications']
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    # Add product images if provided
    if 'images' in data and isinstance(data['images'], list):
        for img_data in data['images']:
            new_image = ProductImage(
                product_id=new_product.id,
                image_url=img_data['image_url'],
                is_primary=img_data.get('is_primary', False)
            )
            db.session.add(new_image)
        
        db.session.commit()
    
    return jsonify(new_product.to_dict()), 201

@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update an existing product (admin only)"""
    from models.user import User
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403
    
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    # Update product fields
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'stock' in data:
        product.stock = data['stock']
    if 'category' in data:
        product.category = data['category']
    if 'specifications' in data:
        if isinstance(data['specifications'], dict):
            product.specifications = json.dumps(data['specifications'])
        else:
            product.specifications = data['specifications']
    
    # Update product images if provided
    if 'images' in data and isinstance(data['images'], list):
        # Delete existing images
        ProductImage.query.filter_by(product_id=product_id).delete()
        
        # Add new images
        for img_data in data['images']:
            new_image = ProductImage(
                product_id=product.id,
                image_url=img_data['image_url'],
                is_primary=img_data.get('is_primary', False)
            )
            db.session.add(new_image)
    
    db.session.commit()
    return jsonify(product.to_dict()), 200

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product (admin only)"""
    from models.user import User
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403
    
    product = Product.query.get_or_404(product_id)
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted successfully'}), 200

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    categories = db.session.query(Product.category).distinct().all()
    return jsonify([category[0] for category in categories]), 200
