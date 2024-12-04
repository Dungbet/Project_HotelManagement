import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';

function ChatIcon() {
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const chatBoxRef = useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    const showDialog = (message) => {
        setDialogMessage(message);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        navigate('/login'); // Chuyển hướng sau khi đóng dialog
    };

    useEffect(() => {
        const fetchUsername = async () => {
            const loggedInUsername = await getLoggedInUsername();
            setUsername(loggedInUsername);
            console.log('Logged in username:', loggedInUsername);
        };
        fetchUsername();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the chat box is open and the click is outside of it and the icon
            if (
                chatBoxRef.current &&
                !chatBoxRef.current.contains(event.target) &&
                !event.target.closest('.chat-icon')
            ) {
                setIsChatBoxOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
    const toggleChatBox = () => {
        if (!username) {
            showDialog('Bạn cần đăng nhập để gửi tin nhắn.');
        } else {
            setIsChatBoxOpen((prevState) => !prevState);
        }
    };

    // Function to handle sending messages
    const handleSendMessage = async () => {
        if (!username) {
            showDialog('Bạn cần đăng nhập để gửi tin nhắn.');
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
                    showDialog('Không thể gửi tin nhắn.');
                }
            } else {
                showDialog('Chưa kết nối được với admin. Vui lòng thử lại sau.');
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
                <button className="chat-icon" onClick={toggleChatBox} aria-label="Open Chat" title="Chat với admin">
                    <i className="fab fa-facebook-messenger"></i>
                </button>
            </div>

            <div className={`chat-box ${isChatBoxOpen ? 'active' : ''}`} ref={chatBoxRef}>
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
            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogTitle>Thông báo</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ChatIcon;
