# This file is used to run the Flask backend in production.
# It imports the Flask app from the app.py file and runs it.
# Run the commands below from the root directory of the project.
# For Linux/MacOs use gunicorn (gunicorn --bind 0.0.0.0:8000 -w 4 wsgi:app) to run the backend.
# For Windows use waitress (waitress-serve --port=8000 wsgi:app) to run the backend.
# You can change the port number as you want.
# The ip address is 0.0.0.0 which means the backend will be accessible from any IP address.
from app import app
