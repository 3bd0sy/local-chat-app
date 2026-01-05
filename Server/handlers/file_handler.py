"""
File upload handlers for large file support with chunking
Supports files up to 10GB with chunk-based uploading
"""

import os
import json
import shutil
from datetime import datetime
from flask import request, jsonify, send_file, current_app
from services.chunk_upload_service import upload_chunk_service
from utils.files.metadata_manager import create_metadata
from utils.files.file_validation import allowed_file
from utils.files.constants import MAX_CHUNK_SIZE, MAX_FILE_SIZE
from utils.files.allowed_extensions import ALLOWED_EXTENSIONS


def register_file_handlers(app, socketio):
    """
    Register all file upload/download endpoints with the Flask app

    Args:
        app: Flask application instance
        socketio: SocketIO instance for real-time communication
    """

    @app.route("/api/files/init", methods=["POST", "OPTIONS"])
    def init_upload():
        """
        Initialize a new file upload session
        Creates a temporary directory for storing chunks

        Expected JSON payload:
        {
            "fileId": "unique-file-id",
            "fileName": "example.pdf",
            "fileSize": 1048576,
            "totalChunks": 10,
            "fileType": "application/pdf",
            "roomId": "room-123",
            "partnerSid": "user-456"
        }

        Returns:
            JSON response with success status and fileId
        """
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204

        try:
            # Parse JSON data from request
            data = request.get_json()

            if not data:
                return (
                    jsonify({"success": False, "error": "No JSON data provided"}),
                    400,
                )

            # Validate required fields
            required_fields = ["fileId", "fileName", "fileSize", "totalChunks"]
            for field in required_fields:
                if field not in data:
                    return (
                        jsonify(
                            {
                                "success": False,
                                "error": f"Missing required field: {field}",
                            }
                        ),
                        400,
                    )

            # Extract data
            file_id = data["fileId"]
            file_name = data["fileName"]
            file_size = int(data["fileSize"])
            total_chunks = int(data["totalChunks"])

            # Validate file size (max 10GB)
            if file_size > MAX_FILE_SIZE:
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024*1024)}GB",
                        }
                    ),
                    400,
                )

            # Validate file type
            if not allowed_file(file_name):
                return (
                    jsonify({"success": False, "error": "File type not allowed"}),
                    400,
                )

            create_metadata(file_id, file_name, file_size, total_chunks, data)
            print(
                f"Upload initialized: {file_name} ({file_size:,} bytes, {total_chunks} chunks)"
            )

            return jsonify(
                {
                    "success": True,
                    "fileId": file_id,
                    "message": "Upload session initialized",
                }
            )

        except ValueError as e:
            print(f"Init upload error (Value): {str(e)}")
            return jsonify({"success": False, "error": "Invalid data format"}), 400

        except Exception as e:
            print(f"Init upload error: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/files/upload-chunk", methods=["POST", "OPTIONS"])
    def upload_chunk():
        """
        Upload a single chunk of the file

        Expected form-data:
        - fileId: unique file identifier
        - chunkIndex: index of current chunk (0-based)
        - totalChunks: total number of chunks
        - chunk: binary file data

        Returns:
            JSON response with progress information
        """
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204

        try:
            # Validate chunk file is present
            if not request.files or "chunk" not in request.files:
                return (
                    jsonify({"success": False, "error": "No chunk file provided"}),
                    400,
                )

            # Extract form data
            file_id = request.form.get("fileId")
            chunk_index = request.form.get("chunkIndex")
            total_chunks = request.form.get("totalChunks")

            if not file_id or chunk_index is None:
                return (
                    jsonify({"success": False, "error": "Missing required parameters"}),
                    400,
                )

            # Convert to integers
            chunk_index = int(chunk_index)
            total_chunks = int(total_chunks) if total_chunks else 1
            chunk_file = request.files["chunk"]

            # Get temporary directory path
            temp_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], file_id)

            # Verify upload session exists
            if not os.path.exists(temp_dir):
                return (
                    jsonify({"success": False, "error": "Upload session not found"}),
                    404,
                )

            data = upload_chunk_service(file_id, chunk_index, total_chunks, chunk_file)
            return jsonify(
                {
                    "success": True,
                    **data,
                }
            )

        except Exception as e:
            print(f"Chunk upload error: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/files/complete", methods=["POST", "OPTIONS"])
    def complete_upload():
        """
        Complete the upload by merging all chunks into final file

        Expected JSON payload:
        {
            "fileId": "unique-file-id",
            "roomId": "room-123" (optional)
        }

        Returns:
            JSON response with file information and download URL
        """
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204

        try:
            # Parse JSON data
            data = request.get_json()

            if not data or "fileId" not in data:
                return jsonify({"success": False, "error": "Missing fileId"}), 400

            file_id = data["fileId"]
            room_id = data.get("roomId")
            partner_sid = data.get("partnerSid")
            upload_id = data.get("uploadId")
            # Get temporary directory path
            temp_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], file_id)

            # Read metadata
            metadata_path = os.path.join(temp_dir, "metadata.json")
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)

            file_name = metadata["fileName"]
            original_name = metadata.get("originalName", file_name)
            total_chunks = metadata["totalChunks"]

            # Verify all chunks are uploaded
            if len(metadata["uploadedChunks"]) != total_chunks:
                missing = total_chunks - len(metadata["uploadedChunks"])
                return (
                    jsonify({"success": False, "error": f"Missing {missing} chunks"}),
                    400,
                )

            print(f"Merging {total_chunks} chunks for: {file_name}")

            # Create final file path
            final_path = os.path.join(
                current_app.config["COMPLETED_FOLDER"], f"{file_id}_{file_name}"
            )

            # Merge all chunks into final file
            with open(final_path, "wb") as outfile:
                for i in range(total_chunks):
                    chunk_path = os.path.join(temp_dir, f"chunk_{i:06d}")

                    # Verify chunk exists
                    if not os.path.exists(chunk_path):
                        raise Exception(f"Missing chunk {i}")

                    # Append chunk to final file
                    with open(chunk_path, "rb") as infile:
                        outfile.write(infile.read())

            # Verify file size matches expected size
            final_size = os.path.getsize(final_path)
            expected_size = metadata["fileSize"]

            if final_size != expected_size:
                print(
                    f"Warning: Size mismatch! Expected: {expected_size}, Got: {final_size}"
                )

            # Delete temporary directory and chunks
            shutil.rmtree(temp_dir)

            print(f"File upload completed: {file_name} ({final_size:,} bytes)")

            if partner_sid:
                file_data = {
                    "fileId": file_id,
                    "fileName": file_name,
                    "originalName": original_name,
                    "fileSize": final_size,
                    "fileType": metadata["fileType"],
                    "fileCategory": metadata.get("fileCategory", "other"),
                    "fileIcon": metadata.get("fileIcon", "📁"),
                    "downloadUrl": f"/api/files/download/{file_id}_{file_name}",
                    "timestamp": datetime.now().isoformat(),
                    "from_sid": partner_sid,
                }

                socketio.emit("file_received", file_data, to=partner_sid)
                print(f"File notification sent to partner: {partner_sid}")

            elif room_id:
                socketio.emit(
                    "file_received",
                    {
                        "fileId": file_id,
                        "fileName": file_name,
                        "originalName": original_name,
                        "fileSize": final_size,
                        "fileType": metadata["fileType"],
                        "fileCategory": metadata.get("fileCategory", "other"),
                        "fileIcon": metadata.get("fileIcon", "📁"),
                        "downloadUrl": f"/api/files/download/{file_id}_{file_name}",
                        "timestamp": datetime.now().isoformat(),
                        "from_sid": request.sid,
                    },
                    room=room_id,
                )
            return jsonify(
                {
                    "success": True,
                    "fileId": file_id,
                    "fileName": file_name,
                    "fileSize": final_size,
                    "fileCategory": metadata.get("fileCategory", "other"),
                    "downloadUrl": f"/api/files/download/{file_id}_{file_name}",
                }
            )

        except Exception as e:
            print(f"Upload completion error: {str(e)}")

            # Cleanup temporary directory on error
            try:
                if "temp_dir" in locals() and os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
            except:
                pass

            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/files/download/<filename>", methods=["GET", "OPTIONS"])
    def download_files(filename):
        """
        Download a completed file

        Args:
            filename: Name of file to download (format: fileId_originalName)

        Returns:
            File download response
        """
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204

        try:
            # Get file path
            file_path = os.path.join(current_app.config["COMPLETED_FOLDER"], filename)

            # Verify file exists
            if not os.path.exists(file_path):
                return jsonify({"error": "File not found"}), 404

            # Extract original filename (remove fileId prefix)
            original_name = filename.split("_", 1)[1] if "_" in filename else filename

            # Send file as attachment
            return send_file(file_path, as_attachment=True, download_name=original_name)

        except Exception as e:
            print(f"Download error: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route("/api/files/cleanup/<file_id>", methods=["DELETE", "OPTIONS"])
    def cleanup_upload(file_id):
        """
        Manually clean up an incomplete upload session

        Args:
            file_id: Unique file identifier

        Returns:
            JSON response with cleanup status
        """
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204

        try:
            temp_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], file_id)

            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                print(f"Cleaned up upload: {file_id}")
                return jsonify({"success": True, "message": "Upload cleaned up"})
            else:
                return jsonify({"success": False, "error": "Upload not found"}), 404

        except Exception as e:
            print(f"Cleanup error: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/files/supported-types", methods=["GET", "OPTIONS"])
    def get_supported_types():
        """
        Get list of supported file types and size limits

        Returns:
            JSON with supported file extensions by category and limits
        """
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204

        return jsonify(
            {
                "success": True,
                "supportedTypes": {
                    category: list(extensions)
                    for category, extensions in ALLOWED_EXTENSIONS.items()
                },
                "maxFileSize": MAX_FILE_SIZE,
                "maxChunkSize": MAX_CHUNK_SIZE,
            }
        )

    print("File upload handlers registered successfully")
