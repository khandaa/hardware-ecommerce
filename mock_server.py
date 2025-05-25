import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# Mock data
products = [
    {
        "id": 1,
        "name": "Professional Cordless Drill",
        "description": "High-performance cordless drill with lithium-ion battery and multiple torque settings",
        "price": 129.99,
        "category": "power_tools",
        "brand": "PowerTech",
        "image_url": "https://via.placeholder.com/500x500?text=Cordless+Drill",
        "stock_quantity": 25,
        "rating": 4.5,
        "review_count": 128,
        "specifications": {
            "power": "18V",
            "battery": "Lithium-ion",
            "weight": "1.5kg",
            "includes": "Charger, case, 2 batteries"
        }
    },
    {
        "id": 2,
        "name": "Digital Laser Measure",
        "description": "Precise digital laser measure with backlit LCD display and multiple measurement modes",
        "price": 79.99,
        "category": "measuring_tools",
        "brand": "MeasurePro",
        "image_url": "https://via.placeholder.com/500x500?text=Laser+Measure",
        "stock_quantity": 15,
        "rating": 4.8,
        "review_count": 94,
        "specifications": {
            "range": "0.05-40m",
            "accuracy": "±1.5mm",
            "battery": "2 x AAA",
            "features": "Area, volume, Pythagoras calculations"
        }
    },
    {
        "id": 3,
        "name": "Heavy-Duty Circular Saw",
        "description": "Powerful circular saw with laser guide and dust extraction port",
        "price": 149.99,
        "category": "power_tools",
        "brand": "PowerTech",
        "image_url": "https://via.placeholder.com/500x500?text=Circular+Saw",
        "stock_quantity": 10,
        "rating": 4.3,
        "review_count": 76,
        "specifications": {
            "power": "1200W",
            "blade_size": "185mm",
            "cutting_depth": "63mm at 90°",
            "features": "Laser guide, dust blower"
        }
    },
    {
        "id": 4,
        "name": "Adjustable Wrench Set",
        "description": "Set of 3 chrome-plated adjustable wrenches with comfortable grip handles",
        "price": 35.99,
        "category": "hand_tools",
        "brand": "ToolMaster",
        "image_url": "https://via.placeholder.com/500x500?text=Wrench+Set",
        "stock_quantity": 30,
        "rating": 4.6,
        "review_count": 112,
        "specifications": {
            "material": "Chrome vanadium steel",
            "sizes": "6\", 8\", 10\"",
            "finish": "Chrome plated",
            "handle": "Non-slip grip"
        }
    }
]

users = [
    {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user"
    }
]

orders = [
    {
        "id": 1,
        "user_id": 1,
        "items": [
            {"product_id": 1, "quantity": 2, "price": 129.99},
            {"product_id": 4, "quantity": 1, "price": 35.99}
        ],
        "total_amount": 295.97,
        "status": "delivered",
        "payment_id": "pay_123456789",
        "created_at": "2025-05-15T14:30:00Z"
    }
]

cart_items = [
    {"product_id": 2, "quantity": 1, "product": products[1]}
]

# API Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    if category:
        filtered_products = [p for p in products if p['category'] == category]
        return jsonify({"products": filtered_products, "total": len(filtered_products)})
    return jsonify({"products": products, "total": len(products)})

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/auth/login', methods=['POST'])
def login():
    return jsonify({
        "access_token": "mock_token",
        "user": users[0]
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    return jsonify({
        "access_token": "mock_token",
        "user": users[0]
    })

@app.route('/api/cart', methods=['GET'])
def get_cart():
    return jsonify({
        "items": cart_items,
        "total_items": len(cart_items),
        "subtotal": sum(item["quantity"] * item["product"]["price"] for item in cart_items)
    })

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    return jsonify({"message": "Item added to cart"})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify({
        "orders": orders,
        "total": len(orders)
    })

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = next((o for o in orders if o['id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

@app.route('/api/orders/admin', methods=['GET'])
def get_admin_orders():
    return jsonify({
        "orders": orders,
        "total": len(orders)
    })

@app.route('/api/payment/create', methods=['POST'])
def create_payment():
    return jsonify({
        "amount": 29599,
        "currency": "INR",
        "order_id": "order_mock123456",
        "key_id": "rzp_test_mock"
    })

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
