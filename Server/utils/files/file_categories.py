from .allowed_extensions import ALLOWED_EXTENSIONS


def get_file_category(filename):
    """
    Determine file category based on extension

    Args:
        filename (str): Name of the file

    Returns:
        str: Category name (images, videos, audio, etc.) or "other"
    """
    if "." not in filename:
        return "other"

    ext = filename.rsplit(".", 1)[1].lower()

    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category

    return "other"


def get_icon_for_category(category):
    """
    Get emoji icon for file category

    Args:
        category (str): File category

    Returns:
        str: Emoji icon
    """
    icons = {
        "images": "🖼️",
        "videos": "🎬",
        "audio": "🎵",
        "documents": "📄",
        "archives": "📦",
        "code": "💻",
        "other": "📁",
    }
    return icons.get(category, "📁")
