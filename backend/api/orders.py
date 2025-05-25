from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.order import Order, OrderItem
from models.cart import CartItem
from models.product import Product
from datetime import datetime

order_bp = Blueprint('orders', __name__)

@order_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    """Get user's orders with pagination"""
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    orders = Order.query.filter_by(user_id=current_user_id)\
        .order_by(Order.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'orders': [order.to_dict() for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    }), 200

@order_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get a single order by ID"""
    current_user_id = get_jwt_identity()
    
    order = Order.query.filter_by(
        id=order_id,
        user_id=current_user_id
    ).first_or_404()
    
    return jsonify(order.to_dict()), 200

@order_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order from cart items"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('shipping_address'):
        return jsonify({'message': 'Shipping address is required'}), 400
    
    # Get cart items
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
    
    if not cart_items:
        return jsonify({'message': 'Cart is empty'}), 400
    
    # Calculate total amount
    total_amount = sum(item.product.price * item.quantity for item in cart_items)
    
    # Create new order
    new_order = Order(
        user_id=current_user_id,
        total_amount=total_amount,
        shipping_address=data['shipping_address']
    )
    
    db.session.add(new_order)
    db.session.flush()  # To get the order ID
    
    # Create order items
    for cart_item in cart_items:
        # Check if product is in stock
        product = cart_item.product
        if product.stock < cart_item.quantity:
            return jsonify({
                'message': f'Insufficient stock for {product.name}'
            }), 400
        
        # Create order item
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        
        # Update product stock
        product.stock -= cart_item.quantity
        
        db.session.add(order_item)
    
    # Clear cart after creating order
    CartItem.query.filter_by(user_id=current_user_id).delete()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Order created successfully',
        'order': new_order.to_dict()
    }), 201

@order_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    """Cancel an order"""
    current_user_id = get_jwt_identity()
    
    order = Order.query.filter_by(
        id=order_id,
        user_id=current_user_id
    ).first_or_404()
    
    # Only pending orders can be cancelled
    if order.status != 'pending':
        return jsonify({
            'message': f'Cannot cancel order with status {order.status}'
        }), 400
    
    # Update order status
    order.status = 'cancelled'
    
    # Restore product stock
    for item in order.order_items:
        product = Product.query.get(item.product_id)
        if product:
            product.stock += item.quantity
    
    db.session.commit()
    
    return jsonify({
        'message': 'Order cancelled successfully',
        'order': order.to_dict()
    }), 200

@order_bp.route('/admin', methods=['GET'])
@jwt_required()
def admin_get_orders():
    """Admin: Get all orders with pagination"""
    from models.user import User
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    
    query = Order.query
    
    if status:
        query = query.filter_by(status=status)
    
    orders = query.order_by(Order.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'orders': [order.to_dict() for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    }), 200

@order_bp.route('/admin/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def admin_update_order_status(order_id):
    """Admin: Update order status"""
    from models.user import User
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('status'):
        return jsonify({'message': 'Status is required'}), 400
    
    order = Order.query.get_or_404(order_id)
    
    # Update order status
    order.status = data['status']
    db.session.commit()
    
    return jsonify({
        'message': 'Order status updated successfully',
        'order': order.to_dict()
    }), 200
