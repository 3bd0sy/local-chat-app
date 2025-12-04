"""
HTTP route handlers for the Flask application
"""

import os
from flask import jsonify, request, send_from_directory
from services.network_service import get_local_ip
from werkzeug.utils import secure_filename


def register_http_handlers(app):
    """
    Register all HTTP routes with the Flask application

    Args:
        app: Flask application instance
    """

    @app.route("/api/my-ip")
    def get_my_ip():
        """
        API endpoint to get current device IP
        """
        return {"ip": get_local_ip()}

    @app.route("/upload", methods=["POST"])
    def upload_file():
        """Handle file uploads"""
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            conversation_id = request.form.get("conversation_id", "default")

            upload_path = os.path.join("/static/uploads", conversation_id)
            os.makedirs(upload_path, exist_ok=True)

            filepath = os.path.join(upload_path, filename)
            file.save(filepath)

            return jsonify(
                {
                    "success": True,
                    "filename": filename,
                    "path": filepath,
                    "size": os.path.getsize(filepath),
                }
            )

        return jsonify({"error": "File type not allowed"}), 400

    @app.route("/download/<conversation_id>/<filename>")
    def download_file(conversation_id, filename):
        """Download a file from a conversation"""
        upload_path = os.path.join("/static/uploads", conversation_id)
        return send_from_directory(upload_path, filename, as_attachment=True)


def allowed_file(filename):
    allowed_extensions = {
        "png",
        "jpg",
        "jpeg",
        "gif",
        "pdf",
        "docx",
        "txt",
        "zip",
        "rar",
    }
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions
