"""
Socket event handlers for real-time communication
"""

from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import uuid

from models.data_models import connected_users, pending_requests, active_calls
from services.user_service import broadcast_user_list, get_user_list

import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def get_client_ip():
    """
    Get REAL client IP address
    WORKING METHOD for direct connections (no proxy)
    """
    try:
        print(f"\n{'='*60}")
        print("🔍 DEBUG IP DETECTION START")
        print(f"{'='*60}")

        if "wsgi.input" in request.environ:
            wsgi_input = request.environ["wsgi.input"]
            print(f"🔍 wsgi.input type: {type(wsgi_input)}")
            print(f"🔍 wsgi.input has _sock: {hasattr(wsgi_input, '_sock')}")

            if hasattr(wsgi_input, "_sock"):
                sock = wsgi_input._sock
                print(f"🔍 Socket type: {type(sock)}")
                print(f"🔍 Socket has getpeername: {hasattr(sock, 'getpeername')}")

                if hasattr(sock, "getpeername"):
                    try:
                        peer = sock.getpeername()
                        print(f"✅ REAL IP from socket.getpeername(): {peer[0]}")
                        print(f"✅ Port: {peer[1] if len(peer) > 1 else 'N/A'}")
                        return peer[0]
                    except Exception as e:
                        print(f"❌ Error in getpeername: {e}")

        remote_addr = request.remote_addr
        print(f"🔍 request.remote_addr: {remote_addr}")

        print(f"\n🔍 Available environ keys:")
        for key in sorted(request.environ.keys()):
            if "IP" in key.upper() or "ADDR" in key.upper() or "REMOTE" in key.upper():
                print(f"  {key}: {request.environ[key]}")

        print(f"\n🔍 All HTTP Headers:")
        for header, value in request.headers.items():
            if "IP" in header.upper() or "FORWARD" in header.upper():
                print(f"  {header}: {value}")

        print(f"{'='*60}")
        print("🔍 DEBUG IP DETECTION END")
        print(f"{'='*60}\n")

        if remote_addr and remote_addr != "127.0.0.1":
            return remote_addr
        elif "REMOTE_ADDR" in request.environ:
            return request.environ["REMOTE_ADDR"]
        else:
            return "unknown"

    except Exception as e:
        print(f"❌ Error in get_client_ip: {e}")
        return request.remote_addr if request.remote_addr else "unknown"


def register_socket_handlers(app, socketio: SocketIO):
    """
    Register all SocketIO event handlers

    Args:
        app: Flask application instance
        socketio: SocketIO instance
    """

    @socketio.on("connect")
    def handle_connect():
        """
        Handle new socket connection
        """
        # Get client IP using improved detection
        client_ip = get_client_ip()
        existing_user = None
        for _, user_info in connected_users.items():
            if user_info["ip"] == client_ip:
                existing_user = user_info
                break

        if existing_user:
            print(
                f"⚠️ User reconnected: {client_ip}. Updating SID from {existing_user['sid']} to {request.sid}"
            )

            del connected_users[existing_user["sid"]]
        print(f"\n\n\n\nDetected client IP: {client_ip} \n\n\n\n")
        transport = request.environ.get("HTTP_UPGRADE", "polling").lower()

        print("=" * 60)
        print(f"✅ NEW CONNECTION")
        print("=" * 60)
        print(f"Socket ID: {request.sid}")
        print(f"Client IP: {client_ip}")
        print(f"Transport: {transport}")
        print(f"User-Agent: {request.headers.get('User-Agent', 'Unknown')[:50]}...")

        # Debug: Print all IP-related info
        print("\n🔍 IP DETECTION DEBUG:")
        print(f"  request.remote_addr: {request.remote_addr}")
        print(
            f"  HTTP_X_FORWARDED_FOR: {request.environ.get('HTTP_X_FORWARDED_FOR', 'Not set')}"
        )
        print(f"  HTTP_X_REAL_IP: {request.environ.get('HTTP_X_REAL_IP', 'Not set')}")
        print(
            f"  X-Forwarded-For (header): {request.headers.get('X-Forwarded-For', 'Not set')}"
        )
        print("=" * 60)

        logger.info(f"New connection: {request.sid} via {transport} from {client_ip}")

        # Store connection info
        connected_users[request.sid] = {
            "sid": request.sid,
            "ip": client_ip,
            "username": f'User_{client_ip.split(".")[-1]}',
            "status": "online",
            "connected_at": datetime.now().isoformat(),
            "current_room": None,
            "in_call": False,
        }

        # Notify client of successful connection
        emit(
            "connection_established",
            {
                "sid": request.sid,
                "ip": client_ip,
                "username": connected_users[request.sid]["username"],
            },
        )

        # Broadcast updated user list to all clients
        broadcast_user_list(socketio)

    @socketio.on("disconnect")
    def handle_disconnect():
        """
        Handle socket disconnection
        """
        if request.sid in connected_users:
            user_info = connected_users[request.sid]
            print(
                f"❌ Client disconnected: {request.sid} ({user_info.get('ip', 'unknown')})"
            )

            # Leave any active rooms
            if user_info.get("current_room"):
                leave_room(user_info["current_room"])
                # Notify room participants
                emit(
                    "user_left_room",
                    {"user": user_info["username"], "sid": request.sid},
                    room=user_info["current_room"],
                )

            # Remove from connected users
            del connected_users[request.sid]

            # Broadcast updated user list
            broadcast_user_list(socketio)

    @socketio.on("set_username")
    def handle_set_username(data):
        """
        Set custom username for user
        """
        username = data.get("username", "").strip()
        if username and request.sid in connected_users:
            connected_users[request.sid]["username"] = username
            emit("username_updated", {"username": username})
            broadcast_user_list(socketio)

    @socketio.on("get_online_users")
    def handle_get_online_users(data=None):
        """
        Get list of all online users
        """
        users_list = get_user_list(exclude_sid=request.sid)
        print(f"socket handler")
        emit("online_users_list", {"users": users_list})

    @socketio.on("send_chat_request")
    def handle_chat_request(data):
        """
        Send private chat request to another user
        """
        target_sid = data.get("target_sid")

        if target_sid not in connected_users:
            emit("request_failed", {"error": "User not found or offline"})
            return

        # Create unique request ID
        request_id = str(uuid.uuid4())

        # Store pending request
        pending_requests[request_id] = {
            "id": request_id,
            "from_sid": request.sid,
            "from_username": connected_users[request.sid]["username"],
            "from_ip": connected_users[request.sid]["ip"],
            "to_sid": target_sid,
            "type": "chat",
            "timestamp": datetime.now().isoformat(),
        }

        # Send request notification to target user
        emit(
            "incoming_chat_request",
            {
                "request_id": request_id,
                "from_sid": request.sid,
                "from_username": connected_users[request.sid]["username"],
                "from_ip": connected_users[request.sid]["ip"],
                "type": "chat",
            },
            room=target_sid,
        )

        # Confirm request sent to sender
        emit(
            "request_sent",
            {
                "request_id": request_id,
                "to_username": connected_users[target_sid]["username"],
            },
        )

        print(f"💬 Chat request from {request.sid} to {target_sid}")

    @socketio.on("accept_chat_request")
    def handle_accept_chat_request(data):
        """
        Accept incoming chat request
        """
        request_id = data.get("request_id")

        if request_id not in pending_requests:
            emit("request_error", {"error": "Request not found"})
            return

        req = pending_requests[request_id]
        from_sid = req["from_sid"]
        to_sid = req["to_sid"]

        # Create private room
        room_id = f"room_{from_sid}_{to_sid}"

        # Add both users to room
        join_room(room_id)
        if from_sid in connected_users:
            connected_users[from_sid]["current_room"] = room_id
            socketio.server.enter_room(from_sid, room_id)

        connected_users[to_sid]["current_room"] = room_id

        # Notify both users
        emit(
            "chat_request_accepted",
            {
                "room_id": room_id,
                "partner_sid": to_sid,
                "partner_username": connected_users[to_sid]["username"],
                "partner_ip": connected_users[to_sid]["ip"],
            },
            room=from_sid,
        )

        emit(
            "chat_started",
            {
                "room_id": room_id,
                "partner_sid": from_sid,
                "partner_username": connected_users[from_sid]["username"],
                "partner_ip": connected_users[from_sid]["ip"],
            },
        )

        # Remove pending request
        del pending_requests[request_id]

        print(f"✅ Chat accepted: {from_sid} <-> {to_sid}")

    @socketio.on("reject_chat_request")
    def handle_reject_chat_request(data):
        """
        Reject incoming chat request
        """
        request_id = data.get("request_id")

        if request_id not in pending_requests:
            return

        req = pending_requests[request_id]
        from_sid = req["from_sid"]

        # Notify requester
        emit(
            "chat_request_rejected",
            {"by_username": connected_users[request.sid]["username"]},
            room=from_sid,
        )

        # Remove pending request
        del pending_requests[request_id]

        print(f"❌ Chat rejected by {request.sid}")

    @socketio.on("send_private_message")
    def handle_private_message(data):
        """
        Send message in private room
        """
        room_id = data.get("room_id")
        message = data.get("message")
        timestamp = data.get("timestamp", datetime.now().strftime("%H:%M"))

        if not room_id or not message:
            return

        # Send to room (excluding sender)
        emit(
            "receive_private_message",
            {
                "from_sid": request.sid,
                "from_username": connected_users[request.sid]["username"],
                "message": message,
                "timestamp": timestamp,
            },
            room=room_id,
            include_self=False,
        )

        print(f"💬 Message in {room_id}: {message[:30]}...")

    @socketio.on("start_call")
    def handle_start_call(data):
        """
        Initiate video/audio call
        """
        target_sid = data.get("target_sid")
        call_type = data.get("call_type", "video")  # 'video' or 'audio'

        if target_sid not in connected_users:
            emit("call_failed", {"error": "User not available"})
            return

        # Check if target is already in a call
        if connected_users[target_sid].get("in_call"):
            emit("call_failed", {"error": "User is busy"})
            return

        # Create call request
        request_id = str(uuid.uuid4())

        pending_requests[request_id] = {
            "id": request_id,
            "from_sid": request.sid,
            "from_username": connected_users[request.sid]["username"],
            "to_sid": target_sid,
            "type": call_type,
            "timestamp": datetime.now().isoformat(),
        }

        # Send call request
        emit(
            "incoming_call",
            {
                "request_id": request_id,
                "from_sid": request.sid,
                "from_username": connected_users[request.sid]["username"],
                "from_ip": connected_users[request.sid]["ip"],
                "call_type": call_type,
            },
            room=target_sid,
        )

        emit("call_ringing", {"to_username": connected_users[target_sid]["username"]})

        print(f"📞 {call_type} call from {request.sid} to {target_sid}")

    @socketio.on("accept_call")
    def handle_accept_call(data):
        """
        Accept incoming call
        """
        request_id = data.get("request_id")

        if request_id not in pending_requests:
            emit("call_error", {"error": "Call request not found"})
            return

        req = pending_requests[request_id]
        from_sid = req["from_sid"]
        to_sid = req["to_sid"]
        call_type = req["type"]

        # Create call room
        room_id = f"call_{from_sid}_{to_sid}"

        # Mark users as in call
        connected_users[from_sid]["in_call"] = True
        connected_users[to_sid]["in_call"] = True

        # Add to active calls
        active_calls[room_id] = {
            "participants": [from_sid, to_sid],
            "type": call_type,
            "started_at": datetime.now().isoformat(),
        }

        # Join call room
        join_room(room_id)
        socketio.server.enter_room(from_sid, room_id)

        # Notify both parties
        emit(
            "call_accepted",
            {"room_id": room_id, "partner_sid": to_sid, "call_type": call_type},
            room=from_sid,
        )

        emit(
            "call_started",
            {"room_id": room_id, "partner_sid": from_sid, "call_type": call_type},
        )

        # Remove pending request
        del pending_requests[request_id]

        # Broadcast updated user list
        broadcast_user_list(socketio)

        print(f"✅ Call started: {from_sid} <-> {to_sid}")

    @socketio.on("reject_call")
    def handle_reject_call(data):
        """
        Reject incoming call
        """
        request_id = data.get("request_id")

        if request_id not in pending_requests:
            return

        req = pending_requests[request_id]
        from_sid = req["from_sid"]

        # Notify caller
        emit(
            "call_rejected",
            {"by_username": connected_users[request.sid]["username"]},
            room=from_sid,
        )

        # Remove pending request
        del pending_requests[request_id]

        print(f"❌ Call rejected by {request.sid}")

    @socketio.on("webrtc_offer")
    def handle_webrtc_offer(data):
        """
        Forward WebRTC offer for video/audio connection
        """
        target_sid = data.get("target_sid")
        offer = data.get("offer")

        if target_sid in connected_users:
            emit(
                "webrtc_offer",
                {"from_sid": request.sid, "offer": offer},
                room=target_sid,
            )
            print(f"📤 WebRTC offer forwarded: {request.sid} -> {target_sid}")

    @socketio.on("webrtc_answer")
    def handle_webrtc_answer(data):
        """
        Forward WebRTC answer
        """
        target_sid = data.get("target_sid")
        answer = data.get("answer")

        if target_sid in connected_users:
            emit(
                "webrtc_answer",
                {"from_sid": request.sid, "answer": answer},
                room=target_sid,
            )
            print(f"📤 WebRTC answer forwarded: {request.sid} -> {target_sid}")

    @socketio.on("webrtc_ice_candidate")
    def handle_ice_candidate(data):
        """
        Forward ICE candidates for WebRTC connection
        """
        target_sid = data.get("target_sid")
        candidate = data.get("candidate")

        if target_sid in connected_users:
            emit(
                "webrtc_ice_candidate",
                {"from_sid": request.sid, "candidate": candidate},
                room=target_sid,
            )
            # Don't print for every ICE candidate (too verbose)

    @socketio.on("end_call")
    def handle_end_call(data):
        """
        End active call
        """
        room_id = data.get("room_id")

        if room_id in active_calls:
            participants = active_calls[room_id]["participants"]

            # Mark users as not in call
            for sid in participants:
                if sid in connected_users:
                    connected_users[sid]["in_call"] = False

            # Notify all participants
            emit(
                "call_ended",
                {"ended_by": connected_users[request.sid]["username"]},
                room=room_id,
            )

            # Remove from active calls
            del active_calls[room_id]

            # Broadcast updated user list
            broadcast_user_list(socketio)

            print(f"📵 Call ended: {room_id}")

    @socketio.on("webrtc_end_call")
    def handle_webrtc_end_call(data):
        """
        Notify peer that call has ended
        """
        target_sid = data.get("target_sid")
        print(f"📞 Call end requested by {request.sid}, notifying {target_sid}")
        if target_sid:
            emit("webrtc_call_ended", room=target_sid)

    @socketio.on("leave_chat")
    def handle_leave_chat(data):
        """
        Leave private chat room
        """
        room_id = data.get("room_id")

        if room_id and request.sid in connected_users:
            # Leave room
            leave_room(room_id)
            connected_users[request.sid]["current_room"] = None

            # Notify other participant
            emit(
                "partner_left_chat",
                {"username": connected_users[request.sid]["username"]},
                room=room_id,
            )

            print(f"👋 User left chat: {request.sid}")
