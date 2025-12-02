# Enhanced Local Network Chat Application

A real-time chat application with video/audio call capabilities designed for local network communication. Built with Flask, Socket.IO, and WebRTC technologies.

## 🚀 Features

- **Real-time Private Messaging**: Instant one-on-one chat between users
- **Video Calls**: High-quality video calls using WebRTC
- **Audio Calls**: Crystal-clear audio calls
- **User Discovery**: Automatic detection of users on the same network
- **Connection Requests**: Accept/reject chat and call requests
- **Modern UI**: Responsive design with beautiful gradients and animations

## 🛠️ Technology Stack

### Backend

- **Flask**: Python web framework
- **Socket.IO**: Real-time bidirectional communication
- **WebRTC**: Peer-to-peer video/audio communication

### Frontend

- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with gradients and animations
- **HTML5**: Semantic markup

## 📁 Project Structure

```
enhanced-chat-app/
├── app.py                 # Main Flask application
├── config/
│   └── settings.py        # Configuration settings
├── models/
│   └── data_models.py     # Data structures and models
├── services/
│   ├── network_service.py # Network utilities
│   └── user_service.py    # User management
├── handlers/
│   ├── socket_handlers.py # Socket event handlers
│   └── http_handlers.py   # HTTP route handlers
├── static/
│   ├── js/               # java scripts
│   ├── html/             # html components
│   └── css/              # CSS stylesheets
├── templates/
│   └── chat_enhanced.html # Main chat interface
└── requirements.txt       # Python dependencies
```

### Frontend Components Structure

```
js/
├── app.js                 # Main application initialization
├── socket-manager.js      # Socket.IO connection handling
├── ui-manager.js          # DOM manipulation and UI updates
├── chat-manager.js        # Chat functionality
├── call-manager.js        # Call management
├── webrtc-manager.js      # WebRTC connection handling
└── utils.js               # Utility functions

css/
├── base.css              # Global styles and reset
├── layout.css            # Page layout
├── sidebar.css           # User sidebar
├── chat-area.css         # Main chat area
├── video-call.css        # Video call components
├── messages.css          # Message bubbles
├── modals.css            # Popup modals
├── buttons.css           # Button styles
└── animations.css        # CSS animations
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.7+
- Modern web browser with WebRTC support

### Backend Setup

1. **Clone or create the project directory**

```bash
mkdir enhanced-chat-app
cd enhanced-chat-app
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install flask flask-socketio
```

4. **Create project structure**

```bash
mkdir -p config models services handlers static/css templates
```

5. **Run the application**

```bash
python app.py
```

The server will start on `http://[your-local-ip]:5000`

### Frontend Setup

1. **Ensure all CSS and JS files are in their respective directories**
2. **Open your browser and navigate to the server URL**
3. **Allow camera and microphone permissions when prompted**

## 🔧 Configuration

### Network Configuration

The application automatically detects your local IP address. To manually configure:

```python
# In config/settings.py
HOST = '0.0.0.0'  # Listen on all interfaces
PORT = 5000       # Server port
```

### WebRTC Configuration

```javascript
// STUN servers for NAT traversal
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
```

## 💡 Usage

### Starting a Chat

1. Open the application in multiple browsers/machines on the same network
2. Users will automatically appear in the sidebar
3. Click the "💬 Chat" button next to any user
4. The recipient can accept or reject the request

### Making Calls

- **Video Call**: Click the "📹 Video" button
- **Audio Call**: Click the "🎤 Audio" button
- **During Call**: Use mute/unmute and video on/off controls
- **End Call**: Click the "📵 End" button

### Sending Messages

- Type your message in the input field
- Press Enter or click the "Send" button
- Messages are delivered in real-time

## 🎯 Key Features Explained

### Real-time Communication

- Uses Socket.IO for instant messaging and notifications
- WebRTC for peer-to-peer video/audio calls
- No data passes through the server during calls

### User Management

- Automatic user discovery on local network
- Online/offline status tracking
- Busy status during active calls

### Connection Handling

- Robust WebRTC signaling with error recovery
- ICE candidate exchange for NAT traversal
- Automatic reconnection handling

## 🔒 Security Features

- Local network only (no external internet required)
- Peer-to-peer media streams (not routed through server)
- No persistent data storage
- Connection request authorization

## 🐛 Troubleshooting

### Common Issues

1. **Camera/Microphone Access**

   - Ensure browser permissions are granted
   - Check if other applications are using the camera

2. **Connection Issues**

   - Verify all devices are on the same network
   - Check firewall settings
   - Ensure port 5000 is accessible

3. **WebRTC Problems**

   - Refresh the page to reset connections
   - Check browser WebRTC support at `about:webrtc`

4. **User Not Appearing**
   - Refresh the user list
   - Check network connectivity
   - Verify server is running

### Debug Mode

Enable debug logging in the browser console:

```javascript
localStorage.setItem("debug", "*");
```

## 🌟 Browser Support

- **Chrome** 60+ 
- **Firefox** 55+ 
- **Safari** 11+ 
- **Edge** 79+ 

## 📝 API Reference

### Socket Events

#### Client to Server

- `get_online_users` - Request user list
- `send_chat_request` - Initiate chat
- `send_private_message` - Send message
- `start_call` - Initiate call
- `webrtc_offer/answer/ice_candidate` - WebRTC signaling

#### Server to Client

- `online_users_list` - User list update
- `incoming_chat_request` - Chat request
- `receive_private_message` - New message
- `call_accepted/started/ended` - Call status

### HTTP Routes

- `GET /` - Main chat interface
- `GET /api/my-ip` - Get client IP address

## 🔮 Future Enhancements

- [ ] Group chats and calls
- [ ] File sharing
- [ ] Message history
- [ ] User authentication
- [ ] Mobile app version
- [ ] Screen sharing
- [ ] Text formatting in messages

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - Web framework
- [Socket.IO](https://socket.io/) - Real-time engine
- [WebRTC](https://webrtc.org/) - Peer-to-peer communication
