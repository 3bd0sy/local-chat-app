import os
from flask import current_app


def get_temp_dir(file_id: str) -> str:
    return os.path.join(current_app.config["UPLOAD_FOLDER"], file_id)


def get_metadata_path(file_id: str) -> str:
    return os.path.join(get_temp_dir(file_id), "metadata.json")


def get_chunk_path(file_id: str, index: int) -> str:
    return os.path.join(get_temp_dir(file_id), f"chunk_{index:06d}")


def get_final_path(file_id: str, filename: str) -> str:
    return os.path.join(current_app.config["COMPLETED_FOLDER"], f"{file_id}_{filename}")
