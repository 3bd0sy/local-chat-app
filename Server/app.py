"""
Local Network Chat Application
Main application entry point
"""

import eventlet
eventlet.monkey_patch()

import eventlet.wsgi
from flask_cors import CORS

# Disable bytecode generation to prevent cluttering the filesystem with .pyc files
import sys

sys.dont_write_bytecode = True

import os
from flask import Flask
from flask_socketio import SocketIO
from config.settings import Config
from handlers.http_handlers import register_http_handlers
from handlers.file_handler import register_file_handlers
from handlers.socket_handlers import register_socket_handlers
from services.network_service import get_local_ip


name = """
         .d8888b.  888888b.   8888888b.   .d88888b.          .d8888b. Y88b   d88P 
        d88P  Y88b 888  "88b  888  "Y88b d88P" "Y88b        d88P  Y88b Y88b d88P  
             .d88P 888  .88P  888    888 888     888        Y88b.       Y88o88P   
            8888"  8888888K.  888    888 888     888         "Y888b.     Y888P    
             "Y8b. 888  "Y88b 888    888 888     888            "Y88b.    888     
        888    888 888    888 888    888 888     888              "888    888     
        Y88b  d88P 888   d88P 888  .d88P Y88b. .d88P        Y88b  d88P    888     
         "Y8888P"  8888888P"  8888888P"   "Y88888P" 88888888 "Y8888P"     888     
"""


def create_app():
    """
    Create and configure the Flask application
    """
    app = Flask(__name__)
    app.config.from_object(Config)


    CORS(app, resources={
        r"/*": {
            "origins": "*",  # ["https://173.10.10.245:5173"]
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["COMPLETED_FOLDER"], exist_ok=True)

    # Initialize SocketIO
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        max_http_buffer_size=100 * 1024 * 1024,  # 100 MB buffer  chunks
        ping_timeout=120,
        ping_interval=25,
        async_mode="eventlet",  # async_mode="threading",
        logger=False,  # Enable logging for debugging
        engineio_logger=False,  # Enable engine.io logging
    )

    # Register handlers
    register_http_handlers(app)
    register_socket_handlers(app, socketio)
    register_file_handlers(app, socketio)

    return app, socketio


if __name__ == "__main__":
    cert_file = "certificate/localhost+2.pem"
    key_file = "certificate/localhost+2-key.pem"
    cert_path = os.path.normpath(cert_file)
    key_path = os.path.normpath(key_file)

    print("🔍 Checking SSL certificates...")
    if not os.path.exists(cert_path):
        print(f" Certificate file not found: {cert_path}")
        print("   Please check the path or generate certificates with mkcert")
        exit(1)
    else:
        print(f" Certificate file found: {cert_path}")

    if not os.path.exists(key_path):
        print(f" Key file not found: {key_path}")
        print("   Please check the path or generate certificates with mkcert")
        exit(1)
    else:
        print(f" Key file found: {key_path}")

    app, socketio = create_app()
    local_ip = get_local_ip()
    port = 5000

    # Display startup information
    print("=" * 60)
    print("🚀 Enhanced Chat Application Server")
    print(name)
    print("=" * 60)
    print(f"📍 Local IP: {local_ip}")
    print(f"🌐 Server URL: https://{local_ip}:{port}")
    print(f"✨ Features:")
    print(f"   • Private chat with connection requests")
    print(f"   • Video calls via WebRTC")
    print(f"   • Audio calls via WebRTC")
    print(f"   • Real-time notifications")
    print("=" * 60)
    print("Press CTRL+C to stop")
    print("=" * 60)

    try:

        print(f"🔒 Creating SSL listener on {local_ip}:{port}...")
        listener = eventlet.wrap_ssl(
            eventlet.listen((local_ip, port)),
            certfile=cert_path,
            keyfile=key_path,
            server_side=True,
        )

        print(" SSL listener created successfully")
        print("🌐 Server is running! Open your browser to:")
        print(f"   https://{local_ip}:{port}")
        print("=" * 60)
        print("Press CTRL+C to stop the server")
        print("=" * 60)

        # run the server with eventlet WSGI server
        eventlet.wsgi.server(listener, app)

    except PermissionError:
        print(
            " Permission denied! Please run as administrator or use a different port"
        )
        print(
            f"   Try: sudo python app.py (Linux/Mac) or Run as Administrator (Windows)"
        )
    except OSError as e:
        print(f" OS Error: {e}")
        print("   Possible causes:")
        print("   1. Port 5000 is already in use")
        print("   2. Firewall blocking the port")
        print("   3. IP address not available")
        print("   Solution: Try changing port or IP address")
    except Exception as e:
        print(f" Unexpected error: {type(e).__name__}: {e}")
        import traceback

        traceback.print_exc()
