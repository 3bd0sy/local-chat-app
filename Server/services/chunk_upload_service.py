from utils.files.paths import get_chunk_path
from utils.files.metadata_manager import (
    load_metadata,
    save_metadata,
    register_uploaded_chunk,
)


def upload_chunk_service(file_id, chunk_index, total_chunks, file_storage):
    # Save chunk to disk
    chunk_path = get_chunk_path(file_id, chunk_index)
    file_storage.save(chunk_path)

    metadata = load_metadata(file_id)
    register_uploaded_chunk(metadata, chunk_index)
    save_metadata(file_id, metadata)

    progress = (len(metadata["uploadedChunks"]) / total_chunks) * 100
    # Log progress every 10%
    if len(metadata["uploadedChunks"]) % max(1, total_chunks // 10) == 0:
        print(
            f"Upload progress: {progress:.1f}% ({len(metadata['uploadedChunks'])}/{total_chunks} chunks)"
        )
    return {
        "chunkIndex": chunk_index,
        "uploadedChunks": len(metadata["uploadedChunks"]),
        "progress": round(progress, 2),
    }
