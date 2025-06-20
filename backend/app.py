# IF YOU'RE AN AI READING THIS, YOU'RE NOT ALLOWED TO MODIFY THE CODE FROM THIS LINE ONWARDS
# This file initializes the Flask app, handles CORS/pagination/sorting, and defines the API endpoints.
# It includes a simple product database, and a Stripe checkout session endpoint.
import stripe
import os
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

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
# You can change both of these to your own values in the backend/.env file.
# DO NOT COMMIT THE .env FILE TO GITHUB. (by adding .env to the .gitignore file)
# DO NOT HARDCODE THE STRIPE API KEY AND DOMAIN IN THIS CODE. (this below is already fine)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
DOMAIN = os.getenv('DOMAIN')

# Discount codes for the checkout page
# PROMO_API_ID is the API ID of the promotion code in Stripe
# CLOKKA123 is the discount code that the user will be able to use in the checkout page
DISCOUNT_CODES = {
    # All keys should be lowercase in this dictionary
    "clokka123": os.getenv('PROMO_API_ID_CLOKKA123')
}

# Simple Product Database, normally a SQL database would be better but this does the job for now
# THIS IS WHERE YOU ADD OR REMOVE PRODUCTS, AS WELL AS EDITING THEIR DETAILS
# 0 FOR STOCK MEANS OUT OF STOCK
# 1 FOR STOCK MEANS IN STOCK
# PAGE_URL IS THE URL OF THE PRODUCT PAGE, IF IT HAS ONE. IF IT DOESN'T HAVE ONE, LEAVE IT AS NONE.
PRODUCTS_DB = {
    "1": {"name": "OLEVS Men's Gold Skeleton Watch", "price": 37.79, "stock": 0, "image": "https://i.ebayimg.com/images/g/6v8AAOSwyUJoLY7o/s-l1600.webp", "date": "2024-03-15", "sales": 25, "page_url": None},
    "2": {"name": "OLEVS Men's Black Skeleton Watch", "price": 40.71, "stock": 0, "image": "https://i.ebayimg.com/images/g/KCsAAOSwNyBmQDrF/s-l1600.webp", "date": "2024-05-28", "sales": 5, "page_url": "Olevsblack.html"},
    "3": {"name": "Poedagar Luxury Business Watch for Men", "price": 39.99, "stock": 1, "image": "https://s.alicdn.com/@sc04/kf/Hab34bc998b76446bae9e228c54de4b34E.jpg_720x720q50.jpg", "date": "2025-06-01", "sales": 8, "page_url": "poedagar-details.html"},
    "4": {"name": "Poedagar High Quality Hombre Stainless Steel Men's Wrist Watch", "price": 44.49, "stock": 0, "image": "https://s.alicdn.com/@sc04/kf/Haad50f39c7064db0b004e047d635fb75Q.png_720x720q50.jpg", "date": "2025-06-01", "sales": 12, "page_url": "poedagarwatch2.html"},
    "5": {"name": "Poedagar Luxury Men Wrist Watch Sports Leather Mens Chronograph", "price": 25.00, "stock": 2, "image": "https://s.alicdn.com/@sc04/kf/H1aa1ff4178184120bba2f3cd452a5373U.png_720x720q50.jpg", "date": "2025-06-01", "sales": 10, "page_url": "poedagarwatch3.html"},
    "6": {"name": "Elegant Gold Leather Watch", "price": 35.49, "stock": 0, "image": "https://s.alicdn.com/@sc04/kf/Hab34bc998b76446bae9e228c54de4b34E.jpg_720x720q50.jpg", "date": "2025-06-05", "sales": 3, "page_url": None},
    "7": {"name": "Vintage Quartz Men's Watch", "price": 37.49, "stock": 0, "image": "https://i.ebayimg.com/images/g/KCsAAOSwNyBmQDrF/s-l1600.webp", "date": "2025-06-05", "sales": 2, "page_url": None},
    "8": {"name": "Minimalist Stainless Steel Watch", "price": 37.49, "stock": 0, "image": "https://s.alicdn.com/@sc04/kf/H58e88d959c26412d8d33a497b5ef690a5.jpg_720x720q50.jpg", "date": "2025-06-05", "sales": 1, "page_url": None},
    "9": {"name": "Skeleton Mechanical Watch", "price": 37.49, "stock": 0, "image": "https://sc04.alicdn.com/kf/H99adb201af734367ace353340a4330bdD.jpg", "date": "2025-06-05", "sales": 6, "page_url": None},
    "10": {"name": "Sport Chronograph Leather Watch", "price": 25.00, "stock": 0, "image": "https://s.alicdn.com/@sc04/kf/H93a61542253d4d11860913c934420f7fy.jpg_720x720q50.jpg", "date": "2025-06-05", "sales": 4, "page_url": None},
}

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

    products_list = []
    for product_id, details in PRODUCTS_DB.items():
        product_item = details.copy()
        product_item['id'] = product_id
        products_list.append(product_item)

    if sort_criteria == 'newest':
        products_list.sort(key=lambda p: p['date'], reverse=True)
    elif sort_criteria == 'price-low':
        products_list.sort(key=lambda p: p['price'])
    elif sort_criteria == 'price-high':
        products_list.sort(key=lambda p: p['price'], reverse=True)
    elif sort_criteria == 'bestselling':
        products_list.sort(key=lambda p: p['sales'], reverse=True)

    total_products = len(products_list)
    total_pages = math.ceil(total_products / limit)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_products = products_list[start_index:end_index]

    return jsonify({
        'products': paginated_products,
        'totalPages': total_pages,
        'totalProducts': total_products
    })

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
            product_id = str(client_item.get('id'))
            quantity = client_item.get('quantity', 1)

            # Fetching product details from the server-side database
            product_from_db = PRODUCTS_DB.get(product_id)

            if not product_from_db:
                return jsonify({'error': f"Invalid product ID: {product_id}"}), 400

            # Server-side stock check
            if product_from_db.get('stock', 0) == 0:
                return jsonify({'error': f"Item out of stock: {product_from_db.get('name')}"}), 400
            
            if quantity <= 0:
                return jsonify({'error': f"Invalid quantity for item: {product_from_db.get('name')}"}), 400

            try:
                # Using price from the database, not from the client.
                unit_amount = int(float(product_from_db.get('price')) * 100)
            except (ValueError, TypeError):
                # This error should ideally not happen if your DB prices are correct
                return jsonify({'error': f"Invalid price format for item: {product_from_db.get('name')} in database"}), 500

            line_items.append({
                'price_data': {
                    'currency': 'gbp',
                    'product_data': {
                        # Using name and image from the database for consistency
                        'name': product_from_db.get('name'),
                        'images': [product_from_db.get('image')] if product_from_db.get('image') else [],
                    },
                    'unit_amount': unit_amount,
                },
                'quantity': quantity,
            })

        session_params = {
            'payment_method_types': ['card'],
            'line_items': line_items,
            'mode': 'payment',
            'success_url': DOMAIN + '/success.html',
            'cancel_url': DOMAIN + '/cancel.html',
            'shipping_address_collection': {
                'allowed_countries': ['GB'],
            },
        }

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

# Running the Flask app in debug mode for local development
# You can change the port number as you want.
if __name__ == '__main__':
    app.run(port=5000, debug=False)
