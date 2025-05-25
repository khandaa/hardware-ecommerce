from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.cart import CartItem
from models.product import Product

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart items"""
    current_user_id = get_jwt_identity()
    
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'cart_items': [item.to_dict() for item in cart_items],
        'total_items': len(cart_items),
        'total_amount': sum(item.product.price * item.quantity for item in cart_items)
    }), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add item to cart"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('product_id') or not data.get('quantity'):
        return jsonify({'message': 'Product ID and quantity are required'}), 400
    
    product_id = data['product_id']
    quantity = int(data['quantity'])
    
    # Validate product exists
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    # Check if product is in stock
    if product.stock < quantity:
        return jsonify({'message': 'Insufficient stock available'}), 400
    
    # Check if item already in cart
    cart_item = CartItem.query.filter_by(
        user_id=current_user_id,
        product_id=product_id
    ).first()
    
    if cart_item:
        # Update quantity if item already in cart
        cart_item.quantity += quantity
    else:
        # Add new item to cart
        cart_item = CartItem(
            user_id=current_user_id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(cart_item)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to cart successfully',
        'cart_item': cart_item.to_dict()
    }), 200

@cart_bp.route('/update/<int:cart_item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(cart_item_id):
    """Update cart item quantity"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data or 'quantity' not in data:
        return jsonify({'message': 'Quantity is required'}), 400
    
    quantity = int(data['quantity'])
    
    # Validate cart item exists and belongs to user
    cart_item = CartItem.query.filter_by(
        id=cart_item_id,
        user_id=current_user_id
    ).first()
    
    if not cart_item:
        return jsonify({'message': 'Cart item not found'}), 404
    
    # Check if product is in stock
    if cart_item.product.stock < quantity:
        return jsonify({'message': 'Insufficient stock available'}), 400
    
    # Update quantity
    cart_item.quantity = quantity
    db.session.commit()
    
    return jsonify({
        'message': 'Cart item updated successfully',
        'cart_item': cart_item.to_dict()
    }), 200

@cart_bp.route('/remove/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_item_id):
    """Remove item from cart"""
    current_user_id = get_jwt_identity()
    
    # Validate cart item exists and belongs to user
    cart_item = CartItem.query.filter_by(
        id=cart_item_id,
        user_id=current_user_id
    ).first()
    
    if not cart_item:
        return jsonify({'message': 'Cart item not found'}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item removed from cart successfully'
    }), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    current_user_id = get_jwt_identity()
    
    CartItem.query.filter_by(user_id=current_user_id).delete()
    db.session.commit()
    
    return jsonify({
        'message': 'Cart cleared successfully'
    }), 200
