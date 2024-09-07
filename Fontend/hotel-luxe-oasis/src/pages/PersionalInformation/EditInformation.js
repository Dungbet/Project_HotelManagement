import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function EditInformation() {
    const [userData, setUserData] = useState({
        id: '',
        username: '',
        name: 'Chưa cập nhật',
        email: '',
        password: '', // Password should not be pre-filled for security reasons
        address: 'Chưa cập nhật',
        phoneNumber: 'Không có số điện thoại',
        gender: '0', // '0' for 'Nữ', '1' for 'Nam'
        avatar: '/default-avatar.png',
        file: null,
    });
    const [searchParams] = useSearchParams(); // Retrieve query parameters
    const navigate = useNavigate();
    const id = searchParams.get('id'); // Extract 'id' from query parameters

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/user/search`, {
                    params: { id },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const { data } = response.data;
                setUserData({
                    id: data.id || '',
                    username: data.username || '',
                    name: data.name || '',
                    email: data.email || '',
                    password: '', // Password should not be pre-filled for security reasons
                    address: data.address || '',
                    phoneNumber: data.phoneNumber || '',
                    gender: data.gender ? '1' : '0',
                    avatar: data.avatar || '/default-avatar.png',
                    file: null,
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login'); // Redirect to login on 401 error
                }
            }
        };

        if (id) {
            fetchUserData();
        } else {
            navigate('/personal-information'); // Redirect if no ID is found
        }
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUserData((prevData) => {
            const updatedData = { ...prevData, file };
            if (file) {
                const fileURL = URL.createObjectURL(file);
                return { ...updatedData, avatar: fileURL };
            }
            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const key in userData) {
            if (key === 'file' && userData[key]) {
                formData.append('file', userData[key]);
            } else if (key !== 'file') {
                formData.append(key, userData[key]);
            }
        }
        try {
            const response = await axios.put(`http://localhost:8080/user/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.data.status === 200) {
                navigate('/persional-information'); // Redirect after successful update
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    return (
        <div className="update-container">
            <div className="update-header">Sửa Thông Tin Cá Nhân</div>

            <div className="update-avatar-container">
                <label htmlFor="avatar-upload">
                    <img src={userData.avatar} alt="Avatar" className="update-avatar" />
                    <input
                        type="file"
                        id="avatar-upload"
                        name="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <div className="update-edit-label">Sửa</div>
                </label>
            </div>

            <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={userData.id} />
                <div className="update-form-group">
                    <label htmlFor="name">Tên:</label>
                    <input type="text" id="name" name="name" value={userData.name} onChange={handleInputChange} />
                </div>

                <div className="update-form-group">
                    <label htmlFor="address">Địa chỉ:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={userData.address}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="update-form-group">
                    <label htmlFor="phoneNumber">Số điện thoại:</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="update-form-group">
                    <label htmlFor="gender">Giới tính:</label>
                    <select id="gender" name="gender" value={userData.gender} onChange={handleInputChange}>
                        <option value="1">Nam</option>
                        <option value="0">Nữ</option>
                    </select>
                </div>
                <div className="update-btn-container">
                    <button type="submit" className="update-btn">
                        Cập nhật
                    </button>
                    <a href="/persional-information" className="update-btn update-btn-cancel">
                        Hủy
                    </a>
                </div>
            </form>
        </div>
    );
}

export default EditInformation;
