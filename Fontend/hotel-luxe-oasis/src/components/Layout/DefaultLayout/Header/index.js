import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
    const [data, setData] = useState({
        avatar: 'path/to/default-avatar.jpg', // Default avatar if no actual URL
        username: '',
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage

            if (!token) {
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Update state with values from API
                setData({
                    avatar: response.data.avatar || 'path/to/default-avatar.jpg', // Default avatar if needed
                    username: response.data.username || '', // Handle null values
                });
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Optionally handle error, e.g., set error state
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login'); // Redirect to login page
    };
    const handleBookNow = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const checkinDate = formatDate(today);
        const checkoutDate = formatDate(tomorrow);

        navigate(
            `/rooms-available?checkinDate=${checkinDate}&checkoutDate=${checkoutDate}&sortedField=price&keyword=&numAdults=1&numChildren=0&numRooms=1`,
        );
    };

    return (
        <>
            {/* Header Section Begin */}
            <header className="header-section header-normal">
                <div className="top-nav">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <ul className="tn-left">
                                    <li>
                                        <i className="fa fa-phone"></i> 0974410454
                                    </li>
                                    <li>
                                        <i className="fa fa-envelope"></i> taquangdung050503@gmail.com
                                    </li>
                                </ul>
                            </div>
                            <div className="col-lg-6">
                                <div className="tn-right">
                                    <div className="top-social">
                                        <Link to="#">
                                            <i className="fa fa-facebook"></i>
                                        </Link>
                                        <Link to="#">
                                            <i className="fa fa-twitter"></i>
                                        </Link>
                                        <Link to="#">
                                            <i className="fa fa-tripadvisor"></i>
                                        </Link>
                                        <Link to="#">
                                            <i className="fa fa-instagram"></i>
                                        </Link>
                                    </div>
                                    <Link to="/rooms" className="bk-btn">
                                        Đặt Ngay
                                    </Link>
                                    {data.username ? (
                                        <div className="language-option">
                                            <img src={data.avatar} className="user-avatar" />
                                            <span>
                                                {data.username} <i className="fa fa-angle-down"></i>
                                            </span>
                                            <div className="flag-dropdown">
                                                <ul>
                                                    <li>
                                                        <Link to="/persional-information">Thông tin cá nhân</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/information-booking">Thông tin đặt phòng</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/change-password">Đổi mật khẩu</Link>
                                                    </li>
                                                    <li>
                                                        <button onClick={handleLogout} className="btn btn-link">
                                                            Đăng xuất
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link to="/login" className="login-btn" title="Đăng Nhập">
                                            <i className="fa-solid fa-right-to-bracket"></i>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="menu-item">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-2">
                                <div className="logo">
                                    <Link to="/">
                                        <img src="img/logo luxe.png" alt="" />
                                    </Link>
                                    <span className="logo-text">Luxe Oasis</span>
                                </div>
                            </div>
                            <div className="col-lg-10">
                                <div className="nav-menu">
                                    <nav className="mainmenu">
                                        <ul>
                                            <li className={location.pathname === '/' ? 'active' : ''}>
                                                <Link to="/">Trang Chủ</Link>
                                            </li>
                                            <li className={location.pathname === '/rooms' ? 'active' : ''}>
                                                <Link
                                                    to="/rooms"
                                                    // to="#"
                                                    // onClick={(event) => {
                                                    //     event.preventDefault(); // Ngăn chặn hành vi mặc định của Link
                                                    //     handleBookNow(); // Gọi hàm để chuyển hướng
                                                    // }}
                                                >
                                                    Đặt Phòng
                                                </Link>
                                            </li>

                                            <li className={location.pathname === '/about-us' ? 'active' : ''}>
                                                <Link to="/about-us">Về Chúng Tôi</Link>
                                            </li>
                                            <li className={location.pathname === '/contact' ? 'active' : ''}>
                                                <Link to="/contact">Liên Hệ</Link>
                                            </li>
                                        </ul>
                                    </nav>
                                    <div className="nav-right search-switch">
                                        <i className="icon_search"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/* Header End */}
        </>
    );
}

export default Header;
