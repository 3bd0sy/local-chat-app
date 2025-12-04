"""
User management and utility functions
"""

from flask_socketio import SocketIO
from models.data_models import connected_users


def broadcast_user_list(socketio: SocketIO):
    """
    Broadcast updated user list to all connected clients

    Args:
        socketio: SocketIO instance for emitting events
    """
    users_list = [
        {
            "sid": user_info["sid"],
            "ip": user_info["ip"],
            "username": user_info["username"],
            "status": user_info["status"],
            "in_call": user_info.get("in_call", False),
        }
        for sid, user_info in connected_users.items()
    ]
    print(f"user service")
    socketio.emit("online_users_list", {"users": users_list})


def get_user_list(exclude_sid: str = None):
    """
    Get list of online users, optionally excluding a specific user

    Args:
        exclude_sid: Socket ID to exclude from the list

    Returns:
        list: List of user dictionaries
    """
    users_list = [
        {
            "sid": user_info["sid"],
            "ip": user_info["ip"],
            "username": user_info["username"],
            "status": user_info["status"],
            "in_call": user_info.get("in_call", False),
        }
        for sid, user_info in connected_users.items()
        if sid != exclude_sid  # Exclude self if specified
    ]

    return users_list
