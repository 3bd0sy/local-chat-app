import json
from datetime import datetime
import os
from flask import current_app
from werkzeug.utils import secure_filename
from .file_categories import get_file_category, get_icon_for_category
from .paths import get_metadata_path


def create_metadata(file_id, file_name, file_size, total_chunks, extra: dict):
    # Create initial metadata structure
    safe_name = secure_filename(file_name)
    category = get_file_category(file_name)

    # Create temporary directory for chunks
    temp_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], file_id)
    os.makedirs(temp_dir, exist_ok=True)

    metadata = {
        "fileId": file_id,
        "fileName": safe_name,
        "originalName": file_name,
        "fileSize": file_size,
        "fileType": extra.get("fileType", ""),
        "fileCategory": category,
        "fileIcon": get_icon_for_category(category),
        "totalChunks": total_chunks,
        "uploadedChunks": [],
        "roomId": extra.get("roomId"),
        "partnerSid": extra.get("partnerSid"),
        "createdAt": datetime.now().isoformat(),
    }

    with open(get_metadata_path(file_id), "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    return metadata


def load_metadata(file_id: str) -> dict:
    # Load metadata from disk
    with open(get_metadata_path(file_id), "r", encoding="utf-8") as f:
        return json.load(f)


def save_metadata(file_id: str, metadata: dict):
    # Persist metadata to disk
    with open(get_metadata_path(file_id), "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)


def register_uploaded_chunk(metadata: dict, chunk_index: int):
    # Register uploaded chunk index
    if chunk_index not in metadata["uploadedChunks"]:
        metadata["uploadedChunks"].append(chunk_index)
        metadata["lastUpdate"] = datetime.now().isoformat()
