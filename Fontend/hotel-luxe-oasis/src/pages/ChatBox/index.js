import React, { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Import format from date-fns

const ChatBox = ({ chatData, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Initialize WebSocket connection
        const socket = new WebSocket('ws://localhost:8080/data');

        socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
            try {
                const message = JSON.parse(event.data);

                // Handle potential invalid timestamp
                let formattedTimestamp = '';
                try {
                    const date = new Date(message.timestamp);
                    if (!isNaN(date.getTime())) {
                        formattedTimestamp = format(date, 'dd/MM/yyyy HH:mm');
                    } else {
                        throw new Error('Invalid date');
                    }
                } catch (error) {
                    console.error('Error parsing date:', error);
                    formattedTimestamp = 'Invalid date'; // Fallback or handle as needed
                }

                // Only add messages relevant to the current chat
                if (
                    (message.sender === chatData?.sender && message.receiver === 'admin') ||
                    (message.receiver === chatData?.sender && message.sender === 'admin')
                ) {
                    const formattedMessage = {
                        ...message,
                        timestamp: formattedTimestamp,
                    };
                    setMessages((prevMessages) => [...prevMessages, formattedMessage]);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
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
    }, [chatData]);

    const handleSendMessage = () => {
        if (newMessage.trim() && ws) {
            const message = {
                sender: 'admin',
                receiver: chatData?.sender,
                content: newMessage,
                timestamp: format(new Date(), 'dd/MM/yyyy HH:mm'), // Format timestamp here
            };
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
                setMessages((prevMessages) => [...prevMessages, message]);
                setNewMessage('');
            } else {
                console.error('WebSocket is not open.');
            }
        }
    };

    return (
        <div className="chat-box-admin">
            <div className="chat-header">
                <h5>{chatData?.sender || 'Chat'}</h5>
                <button className="close-btn" onClick={onClose}>
                    ×
                </button>
            </div>
            <div className="chat-body">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${msg.sender === 'admin' ? 'from-admin-admin' : 'from-admin-user'}`}
                    >
                        <div className="message-content">{msg.content}</div>
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatBox;
