"""
Application configuration settings
"""

import os


class Config:
    """
    Configuration class for Flask application
    """

    SECRET_KEY = os.environ.get("SECRET_KEY", "local_chat_secret_key_2024")
    DEBUG = True

    MAX_CONTENT_LENGTH = 10 * 1024 * 1024 * 1024  # 10 GB
    UPLOAD_FOLDER = "uploads/temp"
    COMPLETED_FOLDER = "uploads/completed"

    # SocketIO configuration
    SOCKETIO_ASYNC_MODE = "threading"
    SOCKETIO_CORS_ALLOWED_ORIGINS = "*"

    # Server configuration
    HOST = "0.0.0.0"
    PORT = 5000
