import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function ChatIcon() {
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsername = async () => {
            const loggedInUsername = await getLoggedInUsername();
            setUsername(loggedInUsername);
            console.log('Logged in username:', loggedInUsername);
        };
        fetchUsername();
    }, []);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/data');

        socket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        socket.onmessage = (event) => {
            console.log('Message received:', event.data);
            try {
                const message = JSON.parse(event.data);
                console.log('Parsed message:', message);

                // Check if the message is relevant to the user or admin
                if (
                    (message.receiver === 'admin' && message.sender === username) ||
                    (message.receiver === username && message.sender === 'admin')
                ) {
                    setMessages((prevMessages) => {
                        const updatedMessages = [
                            ...prevMessages,
                            {
                                text: message.content,
                                fromUser: message.sender === username,
                                timestamp: message.timestamp,
                            },
                        ];
                        return updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    });
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            console.log('WebSocket closed:', event);
        };

        setWs(socket);

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [username]);

    // Function to toggle chat box visibility
    // Function to toggle chat box visibility
    const toggleChatBox = () => {
        if (!username) {
            alert('Bạn cần đăng nhập để gửi tin nhắn.');
            navigate('/login');
        } else {
            setIsChatBoxOpen(!isChatBoxOpen);
        }
    };

    // Function to handle sending messages
    const handleSendMessage = async () => {
        if (!username) {
            alert('Bạn cần đăng nhập để gửi tin nhắn.');
            navigate('/login');
            return;
        }

        if (newMessage.trim()) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                const message = {
                    sender: username,
                    receiver: 'admin',
                    content: newMessage,
                    timestamp: format(new Date(), 'dd/MM/yyyy HH:mm'),
                };
                try {
                    ws.send(JSON.stringify(message));
                    setMessages((prevMessages) => {
                        const updatedMessages = [
                            ...prevMessages,
                            {
                                text: newMessage,
                                fromUser: true,
                                timestamp: message.timestamp,
                            },
                        ];
                        return updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    });
                    setNewMessage('');
                    setError('');
                } catch (e) {
                    setError('Không thể gửi tin nhắn.');
                }
            } else {
                setError('Chưa kết nối được với admin. Vui lòng thử lại sau.');
            }
        }
    };

    // Function to get logged-in username
    const getLoggedInUsername = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    return data.username;
                } else {
                    throw new Error('Failed to fetch user info');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                return '';
            }
        }
        return '';
    };

    return (
        <>
            <div className="chat-messenger-icons">
                <button className="chat-icon" onClick={toggleChatBox} aria-label="Open Chat">
                    <i className="fab fa-facebook-messenger"></i>
                </button>
            </div>

            <div className={`chat-box ${isChatBoxOpen ? 'active' : ''}`}>
                <div className="chat-box-header">Nhắn tin với Admin</div>
                {error && <div className="chat-box-error">{error}</div>}
                <div className="chat-box-content">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.fromUser ? 'from-user' : 'from-admin'}`}>
                            <div className="message-text">{msg.text}</div>
                            {/* Uncomment if you want to display timestamps */}
                            {/* <div className="message-timestamp">{msg.timestamp}</div> */}
                        </div>
                    ))}
                </div>
                <div className="chat-box-footer">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                    />
                    <button onClick={handleSendMessage} disabled={!username}>
                        Gửi
                    </button>
                </div>
            </div>
        </>
    );
}

export default ChatIcon;
