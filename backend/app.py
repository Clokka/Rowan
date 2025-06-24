# This file initializes the Flask app, handles CORS/pagination/sorting, and defines the API endpoints.
# It includes a simple product database, and a Stripe checkout session endpoint.
import stripe
import os
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
from functools import wraps

load_dotenv() # Loading environment variables from a .env file (in the backend/ directory)

# Initializing Flask app and enabling CORS
# backend/.env file should have CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://clokka.co.uk
origins = os.getenv('CORS_ORIGINS')
app = Flask(__name__)
if origins:
    CORS(app, origins=origins.split(','))
else:
    CORS(app)

# Stripe API key and domain
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
DOMAIN = os.getenv('DOMAIN')

ADMIN_API_KEY = os.getenv('ADMIN_API_KEY')

# MongoDB Connection Setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.reicluster
products_collection = db.products

# Creating indexes to improve sort performance
products_collection.create_index([("date", -1)])
products_collection.create_index([("price", 1)])
products_collection.create_index([("sales", -1)])

# Security Decorator for Admin Routes
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.headers.get('X-API-Key') and request.headers.get('X-API-Key') == ADMIN_API_KEY:
            return f(*args, **kwargs)
        else:
            return jsonify({"message": "API key is missing or invalid."}), 401
    return decorated_function

# Discount codes for the checkout page
# PROMO_API_ID is the API ID of the promotion code in Stripe
# All keys should be lowercase in this dictionary
DISCOUNT_CODES = {
    "clokka123": os.getenv('
LPa7trtR')
 "clock123": os.getenv('
D688y5Fv')}

@app.route('/api/discount-details', methods=['GET'])
def get_discount_details():
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'Discount code is required.'}), 400
    
    # Converting input to lowercase to match the keys in the DISCOUNT_CODES dictionary
    promo_id = DISCOUNT_CODES.get(code.lower())
    if not promo_id:
        return jsonify({'error': 'Invalid discount code.'}), 404
    
    if not promo_id.startswith('promo_'):
        app.logger.warning(f"Attempted to look up non-promo code: {promo_id}")
        return jsonify({'error': 'Discount lookup not supported for this code type.'}), 400
    
    try:
        promo_code = stripe.PromotionCode.retrieve(promo_id, expand=['coupon'])
        if not promo_code.active or not promo_code.coupon:
            return jsonify({'error': 'This discount code is not active.'}), 404
        percent_off = promo_code.coupon.percent_off
        if not percent_off:
            return jsonify({'error': 'This discount is for a fixed amount, not a percentage.'}), 400
        return jsonify({'percent': percent_off})
    
    except stripe.error.StripeError as e:
        app.logger.error(f"Stripe API error fetching discount: {e}")
        return jsonify({'error': 'Could not validate discount code with our payment provider.'}), 500
    except Exception as e:
        app.logger.error(f"Error fetching discount details: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    sort_criteria = request.args.get('sort', 'newest')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 12))

    sort_map = {
        'newest': [('date', -1)],
        'price-low': [('price', 1)],
        'price-high': [('price', -1)],
        'bestselling': [('sales', -1)]
    }
    sort_query = sort_map.get(sort_criteria, [('date', -1)])

    start_index = (page - 1) * limit
    
    # Fetching one more document than the limit to check for a next page
    products_cursor = products_collection.find().sort(sort_query).skip(start_index).limit(limit + 1)
    
    products_list = []
    for product in products_cursor:
        product['id'] = str(product['_id'])
        del product['_id']
        products_list.append(product)

    # Determining if there's a next page
    has_next_page = len(products_list) > limit
    
    # Trimming the extra product if it exists
    if has_next_page:
        products_list = products_list[:-1]

    return jsonify({
        'products': products_list,
        'hasNextPage': has_next_page,
        'currentPage': page
    })

# Admin API Endpoints
@app.route('/api/admin/products', methods=['POST'])
@require_api_key
def add_product():
    try:
        data = request.get_json()
        required_fields = ['name', 'price', 'stock', 'image', 'date', 'sales']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400      
        result = products_collection.insert_one(data)
        new_product_id = str(result.inserted_id)
        
        return jsonify({'message': 'Product added successfully', 'productId': new_product_id}), 201
    except Exception as e:
        app.logger.error(f"Error adding product: {e}")
        return jsonify({'error': "An internal server error occurred."}), 500

@app.route('/api/admin/products/<product_id>', methods=['PUT'])
@require_api_key
def update_product(product_id):
    try:
        data = request.get_json()
        if '_id' in data:
            del data['_id']
            
        result = products_collection.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Product not found'}), 404
            
        return jsonify({'message': 'Product updated successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error updating product: {e}")
        return jsonify({'error': "An internal server error occurred."}), 500

@app.route('/api/admin/products/<product_id>', methods=['DELETE'])
@require_api_key
def delete_product(product_id):
    try:
        result = products_collection.delete_one({'_id': ObjectId(product_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Product not found'}), 404
            
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error deleting product: {e}")
        return jsonify({'error': "An internal server error occurred."}), 500

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        if product:
            # Converting ObjectId to string to be able to return it in the JSON response
            product['id'] = str(product['_id'])
            del product['_id']
            return jsonify(product)
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        app.logger.error(f"Error fetching product: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        cart_items_from_client = data.get('items', [])
        discount_code_from_client = data.get('discountCode')
        if not cart_items_from_client:
            return jsonify({'error': 'No items in cart'}), 400
        line_items = []
        for client_item in cart_items_from_client:
            product_id_str = str(client_item.get('id'))
            quantity = client_item.get('quantity', 1)
            product_from_db = products_collection.find_one({'_id': ObjectId(product_id_str)})
            if not product_from_db:
                return jsonify({'error': f"Invalid product ID: {product_id_str}"}), 400
            if product_from_db.get('stock', 0) == 0:
                return jsonify({'error': f"Item out of stock: {product_from_db.get('name')}"}), 400
            if quantity <= 0:
                return jsonify({'error': f"Invalid quantity for item: {product_from_db.get('name')}"}), 400
            try:
                unit_amount = int(float(product_from_db.get('price')) * 100)
            except (ValueError, TypeError):
                return jsonify({'error': f"Invalid price format for item: {product_from_db.get('name')} in database"}), 500
            line_items.append({'price_data': {'currency': 'gbp','product_data': {'name': product_from_db.get('name'),'images': [product_from_db.get('image')] if product_from_db.get('image') else []},'unit_amount': unit_amount},'quantity': quantity})
        session_params = {'payment_method_types': ['card'],'line_items': line_items,'mode': 'payment','success_url': DOMAIN + '/success.html','cancel_url': DOMAIN + '/cancel.html','shipping_address_collection': {'allowed_countries': ['GB']}}
        if discount_code_from_client:
            stripe_id = DISCOUNT_CODES.get(discount_code_from_client.lower())
            if stripe_id:
                if stripe_id.startswith('promo_'):
                    session_params['discounts'] = [{'promotion_code': stripe_id}]
                elif stripe_id.startswith('cp_'):
                    session_params['discounts'] = [{'coupon': stripe_id}]
                else:
                    app.logger.error(f"Malformed Stripe ID in DISCOUNT_CODES: {stripe_id}")
                    return jsonify({'error': 'Server configuration error for discount code.'}), 500
            else:
                return jsonify({'error': 'Invalid discount code.'}), 400
        checkout_session = stripe.checkout.Session.create(**session_params)
        return jsonify({'url': checkout_session.url})
    except Exception as e:
        app.logger.error(f"Error creating checkout session: {e}")
        return jsonify({'error': "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=False)
