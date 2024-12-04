import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '~/pages/ChatBox'; // Import the ChatBox component

function Header() {
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('/resource/admin/img/user.jpg'); // Default avatar
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [messages, setMessages] = useState([]); // State to hold messages
    const [showChatBox, setShowChatBox] = useState(false); // State to control chat box visibility
    const [activeChat, setActiveChat] = useState(null); // State to store active chat
    const [chatData, setChatData] = useState(null); // State to store chat data
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });

                if (response.data.role.name !== 'ROLE_MANAGER') {
                    // If user is not an admin, log them out and redirect to login page
                    handleLogout();
                    return;
                }

                setUsername(response.data.username);
                setAvatar(response.data.avatar || '/resource/admin/img/user.jpg');
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error fetching user info:', error);
                setIsLoggedIn(false);
                navigate('/admin/login');
            }
        };

        fetchUser();
    }, [navigate]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = getToken();
                const response = await axios.get(`http://localhost:8080/messages/user/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        if (isLoggedIn) {
            fetchMessages();
        }
    }, [isLoggedIn, username]);

    const handleLogout = async () => {
        try {
            await axios.post(
                'http://localhost:8080/auth/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );
            localStorage.removeItem('token');
            localStorage.removeItem('username'); // Remove username
            setIsLoggedIn(false);
            navigate('/admin/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleChangePassword = () => {
        navigate('/change-password'); // Redirect to change password page
    };

    const handleMessageClick = (message) => {
        if (activeChat && activeChat.id === message.id) {
            setShowChatBox(!showChatBox); // Toggle visibility if same chat is clicked
        } else {
            setActiveChat(message);
            setChatData({ sender: message.sender, text: message.content }); // Update chatData with sender name and content
            setShowChatBox(true); // Show chat box
        }
    };

    // Group messages by sender and get the latest message for each sender
    const getLatestMessagesBySender = () => {
        const latestMessages = {};

        messages.forEach((message) => {
            const sender = message.sender;
            if (!latestMessages[sender] || new Date(message.timestamp) > new Date(latestMessages[sender].timestamp)) {
                latestMessages[sender] = message;
            }
        });

        return Object.values(latestMessages);
    };

    const latestMessagesBySender = getLatestMessagesBySender();

    const handleMessageDropdownClick = () => {
        setShowMessageDropdown((prev) => !prev);
        setShowNotificationDropdown(false); // Hide other dropdowns
        setShowUserDropdown(false); // Hide other dropdowns
    };

    const handleDocumentClick = (e) => {
        // Close dropdown if clicked outside
        if (!e.target.closest('.nav-item.dropdown')) {
            setShowMessageDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    return (
        <nav className="navbar navbar-expand bg-light navbar-light sticky-top px-4 py-0">
            <a href="index.html" className="navbar-brand d-flex d-lg-none me-4">
                <h2 className="text-primary mb-0">
                    <i className="fa fa-hashtag"></i>
                </h2>
            </a>
            <a href="#" className="sidebar-toggler flex-shrink-0">
                <i className="fa fa-bars"></i>
            </a>
            <form className="d-none d-md-flex ms-4">
                <input className="form-control border-0" type="search" placeholder="Search" />
            </form>
            <div className="navbar-nav align-items-center ms-auto">
                <div className="nav-item dropdown" onClick={handleMessageDropdownClick}>
                    <a href="#" className="nav-link">
                        <i className="fa fa-envelope me-lg-2"></i>
                        <span className="d-none d-lg-inline-flex">Tin nhắn</span>
                        <i className="fas fa-caret-down ms-2"></i>
                    </a>
                    <div
                        className={`dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 ${
                            showMessageDropdown ? 'show' : ''
                        }`}
                    >
                        {latestMessagesBySender.slice(0, 5).map((message) => (
                            <a
                                key={message.id}
                                href="#"
                                className="dropdown-item d-flex align-items-center message"
                                onClick={() => handleMessageClick(message)}
                            >
                                <div>
                                    <h6 className="fw-normal mb-0">{message.sender}</h6>
                                    <small className="text-muted">
                                        {message.content} {/* Format timestamp */}
                                    </small>
                                </div>
                            </a>
                        ))}
                        {latestMessagesBySender.length > 5 && (
                            <div className="text-center mt-2">
                                <a href="#" className="text-primary">
                                    See all messages
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                <div
                    className="nav-item dropdown"
                    onMouseEnter={() => setShowNotificationDropdown(true)}
                    onMouseLeave={() => setShowNotificationDropdown(false)}
                >
                    <a href="#" className="nav-link">
                        <i className="fa fa-bell me-lg-2"></i>
                        <span className="d-none d-lg-inline-flex">Thông báo</span>
                        <i className="fas fa-caret-down ms-2"></i>
                    </a>
                    <div
                        className={`dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 ${
                            showNotificationDropdown ? 'show' : ''
                        }`}
                    >
                        {/* Notification items */}
                    </div>
                </div>
                <div
                    className="nav-item dropdown"
                    onMouseEnter={() => setShowUserDropdown(true)}
                    onMouseLeave={() => setShowUserDropdown(false)}
                >
                    <a href="#" className="nav-link">
                        <img
                            className="rounded-circle me-lg-2"
                            src={avatar}
                            alt="User Avatar"
                            style={{ width: '40px', height: '40px' }}
                        />
                        <span className="d-none d-lg-inline-flex">{username}</span>
                        <i className="fas fa-caret-down ms-2"></i>
                    </a>
                    <div
                        className={`dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0 ${
                            showUserDropdown ? 'show' : ''
                        }`}
                    >
                        <Link to="/admin/change-password" className="dropdown-item" onClick={handleChangePassword}>
                            <i className="fa fa-user me-2"></i> Đổi mật khẩu
                        </Link>
                        <a href="#" className="dropdown-item" onClick={handleLogout}>
                            <i className="fa fa-sign-out-alt me-2"></i> Đăng xuất
                        </a>
                    </div>
                </div>
            </div>

            {showChatBox && (
                <ChatBox activeChat={activeChat} chatData={chatData} onClose={() => setShowChatBox(false)} />
            )}
        </nav>
    );
}

export default Header;
