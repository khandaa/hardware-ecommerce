from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.order import Order
import razorpay
import json

payment_bp = Blueprint('payment', __name__)

def get_razorpay_client():
    """Get Razorpay client instance"""
    key_id = current_app.config.get('RAZORPAY_KEY_ID')
    key_secret = current_app.config.get('RAZORPAY_KEY_SECRET')
    
    if not key_id or not key_secret:
        raise ValueError("Razorpay credentials not configured")
    
    return razorpay.Client(auth=(key_id, key_secret))

@payment_bp.route('/create-order/<int:order_id>', methods=['POST'])
@jwt_required()
def create_payment_order(order_id):
    """Create Razorpay order for an existing order"""
    current_user_id = get_jwt_identity()
    
    # Get the order
    order = Order.query.filter_by(
        id=order_id,
        user_id=current_user_id
    ).first_or_404()
    
    # Check if order is in pending status
    if order.status != 'pending':
        return jsonify({
            'message': f'Cannot process payment for order with status {order.status}'
        }), 400
    
    try:
        # Initialize Razorpay client
        client = get_razorpay_client()
        
        # Create Razorpay order
        # Amount should be in paise (multiply by 100)
        payment_order = client.order.create({
            'amount': int(order.total_amount * 100),
            'currency': 'INR',
            'receipt': f'order_{order.id}',
            'payment_capture': 1  # Auto-capture
        })
        
        return jsonify({
            'message': 'Payment order created successfully',
            'order_id': payment_order['id'],
            'amount': payment_order['amount'] / 100,
            'currency': payment_order['currency']
        }), 200
    
    except Exception as e:
        return jsonify({
            'message': 'Failed to create payment order',
            'error': str(e)
        }), 500

@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    """Verify Razorpay payment and update order status"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'order_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Field {field} is required'}), 400
    
    # Get the order
    order = Order.query.filter_by(
        id=data['order_id'],
        user_id=current_user_id
    ).first_or_404()
    
    try:
        # Initialize Razorpay client
        client = get_razorpay_client()
        
        # Verify payment signature
        params_dict = {
            'razorpay_order_id': data['razorpay_order_id'],
            'razorpay_payment_id': data['razorpay_payment_id'],
            'razorpay_signature': data['razorpay_signature']
        }
        
        client.utility.verify_payment_signature(params_dict)
        
        # Update order status and payment ID
        order.status = 'paid'
        order.payment_id = data['razorpay_payment_id']
        db.session.commit()
        
        return jsonify({
            'message': 'Payment verified successfully',
            'order': order.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'message': 'Payment verification failed',
            'error': str(e)
        }), 400

@payment_bp.route('/status/<string:payment_id>', methods=['GET'])
@jwt_required()
def payment_status(payment_id):
    """Get payment status from Razorpay"""
    try:
        # Initialize Razorpay client
        client = get_razorpay_client()
        
        # Get payment details
        payment = client.payment.fetch(payment_id)
        
        return jsonify({
            'status': payment['status'],
            'payment': payment
        }), 200
    
    except Exception as e:
        return jsonify({
            'message': 'Failed to get payment status',
            'error': str(e)
        }), 400
