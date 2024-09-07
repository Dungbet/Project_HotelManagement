import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
// Import the CSS file

function PersionalInformation() {
    const [data, setData] = useState({
        avatar: 'path/to/default-avatar.jpg', // Default avatar if no actual URL
        name: '',
        username: '',
        email: '',
        address: '',
        phoneNumber: '',
        gender: true, // true for 'Nam', false for 'Nữ'
        id: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage

            if (!token) {
                navigate('/login'); // Redirect to login page if no token
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Update data with values from API
                setData({
                    ...response.data,
                    avatar: response.data.avatar || '', // Default avatar if needed
                    phoneNumber: response.data.phoneNumber || '', // Handle null values
                    name: response.data.name || '', // Handle null values
                    address: response.data.address || '', // Handle null values
                });
            } catch (error) {
                console.error('Error fetching user info:', error);
                setError('Không thể lấy thông tin cá nhân.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="personal-info-container">
            <div className="personal-info-card">
                <div className="personal-info-header">Thông tin cá nhân</div>
                <ul className="personal-info-list">
                    <li className="personal-info-item">
                        <div className="personal-info-avatar-container">
                            <img src={data.avatar} alt="Avatar" />
                        </div>
                    </li>
                    <li className="personal-info-item">
                        <strong>Tên:</strong> <span>{data.name}</span>
                    </li>
                    <li className="personal-info-item">
                        <strong>Tên đăng nhập:</strong> <span>{data.username}</span>
                    </li>
                    <li className="personal-info-item">
                        <strong>Email:</strong> <span>{data.email}</span>
                    </li>

                    <li className="personal-info-item">
                        <strong>Địa chỉ:</strong> <span>{data.address}</span>
                    </li>
                    <li className="personal-info-item">
                        <strong>Số điện thoại:</strong> <span>{data.phoneNumber}</span>
                    </li>
                    <li className="personal-info-item">
                        <strong>Giới tính:</strong> <span>{data.gender ? 'Nam' : 'Nữ'}</span>
                    </li>
                </ul>
                <div className="personal-info-btn-container">
                    <Link to={`/edit-information?id=${data.id}`} className="personal-info-btn">
                        Sửa
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PersionalInformation;
