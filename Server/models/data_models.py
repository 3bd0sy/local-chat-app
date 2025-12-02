"""
Data models and structures for the chat application
"""

from typing import Dict, List, Optional, TypedDict


class UserInfo(TypedDict):
    """
    User information structure
    """

    sid: str
    ip: str
    username: str
    status: str
    connected_at: str
    current_room: Optional[str]
    in_call: bool


class ChatRequest(TypedDict):
    """
    Chat request structure
    """

    id: str
    from_sid: str
    from_username: str
    from_ip: str
    to_sid: str
    type: str  # 'chat', 'video', 'audio'
    timestamp: str


class ActiveCall(TypedDict):
    """
    Active call information structure
    """

    participants: List[str]
    type: str  # 'video' or 'audio'
    started_at: str


# Global data stores
connected_users: Dict[str, UserInfo] = {}
pending_requests: Dict[str, ChatRequest] = {}
active_calls: Dict[str, ActiveCall] = {}
