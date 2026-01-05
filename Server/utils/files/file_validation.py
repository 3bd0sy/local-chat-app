from .allowed_extensions import ALLOWED_EXTENSIONS


def allowed_file(filename):
    """
    Check if file extension is allowed

    Args:
        filename (str): Name of the file to check

    Returns:
        bool: True if extension is allowed, False otherwise
    """
    if "." not in filename:
        return False

    ext = filename.rsplit(".", 1)[1].lower()

    # Combine all allowed extensions into one set
    allowed_exts = {ext for category in ALLOWED_EXTENSIONS.values() for ext in category}

    return ext in allowed_exts
