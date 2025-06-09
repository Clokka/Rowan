# This file initializes the Flask app, handles CORS, and defines the API endpoints.
# It includes a simple product database, and a Stripe checkout session endpoint.
import stripe
import os
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

# Simple Product Database, normally a SQL database would be better but this does the job for now
# Product IDs here must match those used in shop.html (data-id) 1, 2, 3..
PRODUCTS_DB = {
    "1": {"name": "OLEVS Men's Gold Skeleton Watch", "price": 42.79, "image": "https://i.ebayimg.com/images/g/6v8AAOSwyUJoLY7o/s-l1600.webp"},
    "2": {"name": "OLEVS Men's Black Skeleton Watch", "price": 40.71, "image": "https://i.ebayimg.com/images/g/KCsAAOSwNyBmQDrF/s-l1600.webp"},
    "3": {"name": "Poedagar Luxury Business Watch for Men", "price": 39.99, "image": "https://s.alicdn.com/@sc04/kf/Hab34bc998b76446bae9e228c54de4b34E.jpg_720x720q50.jpg"},
    "4": {"name": "Poedagar High Quality Hombre Stainless Steel Men's Wrist Watch", "price": 44.49, "image": "https://s.alicdn.com/@sc04/kf/Haad50f39c7064db0b004e047d635fb75Q.png_720x720q50.jpg"},
    "5": {"name": "Poedagar Luxury Men Wrist Watch Sports Leather Mens Chronograph", "price": 38.50, "image": "https://s.alicdn.com/@sc04/kf/H1aa1ff4178184120bba2f3cd452a5373U.png_720x720q50.jpg"},
    "6": {"name": "Elegant Gold Leather Watch", "price": 41.25, "image": "https://s.alicdn.com/@sc04/kf/Hab34bc998b76446bae9e228c54de4b34E.jpg_720x720q50.jpg"},
    "7": {"name": "Vintage Quartz Men's Watch", "price": 36.99, "image": "https://i.ebayimg.com/images/g/KCsAAOSwNyBmQDrF/s-l1600.webp"},
    "8": {"name": "Minimalist Stainless Steel Watch", "price": 49.00, "image": "https://s.alicdn.com/@sc04/kf/H58e88d959c26412d8d33a497b5ef690a5.jpg_720x720q50.jpg"},
    "9": {"name": "Skeleton Mechanical Watch", "price": 45.99, "image": "https://sc04.alicdn.com/kf/H99adb201af734367ace353340a4330bdD.jpg"},
    "10": {"name": "Sport Chronograph Leather Watch", "price": 34.50, "image": "https://s.alicdn.com/@sc04/kf/H93a61542253d4d11860913c934420f7fy.jpg_720x720q50.jpg"},
}

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        cart_items_from_client = data.get('items', [])

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

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=DOMAIN + '/success.html', # Creating a success.html or a Flask route
            cancel_url=DOMAIN + '/cancel.html',   # Creating a cancel.html or a Flask route
        )
        return jsonify({'url': checkout_session.url})

    except Exception as e:
        app.logger.error(f"Error creating checkout session: {e}")
        return jsonify({'error': "An internal server error occurred."}), 500

# Running the Flask app in debug mode for local development
# You can change the port number as you want.
if __name__ == '__main__':
    app.run(port=5000, debug=True)