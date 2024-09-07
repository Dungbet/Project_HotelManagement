import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function AddUser() {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        phoneNumber: '',
        email: '',
        address: '',
        gender: 'true',
        roleId: '', // ID của role
        enable: true,
        file: null,
    });
    const [errorEmail, setErrorEmail] = useState('');
    const [errorUsername, setErrorUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // New state for loading

    const getToken = () => localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = getToken();
                const response = await axios.get('http://localhost:8080/admin/role/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (Array.isArray(response.data.data)) {
                    setRoles(response.data.data);
                } else {
                    console.error('API did not return an array for roles', response.data);
                }
            } catch (error) {
                console.error('Error fetching roles', error);
            }
        };

        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when starting the request

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('username', formData.username);
            data.append('password', formData.password);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('email', formData.email);
            data.append('address', formData.address);
            data.append('gender', formData.gender);
            data.append('role.id', formData.roleId); // Gửi roleId như một tham số
            data.append('enable', formData.enable); // Gửi trạng thái kích hoạt
            if (formData.file) {
                data.append('file', formData.file);
            }

            const token = getToken();
            const response = await axios.post('http://localhost:8080/admin/user/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Check response for error messages
            const responseData = response.data;
            if (responseData.msg) {
                if (responseData.msg.includes('Email đã tồn tại')) {
                    setErrorEmail('Email đã tồn tại');
                } else if (responseData.msg.includes('Tên đăng nhập đã tồn tại')) {
                    setErrorUsername('Tên đăng nhập đã tồn tại');
                } else {
                    navigate('/admin/user');
                }
                setLoading(false);
                return;
            }

            // Nếu không có lỗi, điều hướng tới trang người dùng
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Có lỗi xảy ra.');
        } finally {
            setLoading(false); // Set loading to false after the request completes
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Thêm Người Dùng</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            Tên
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Tên tài khoản
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        {errorUsername && <div className="text-danger">{errorUsername}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                            Điện thoại
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errorEmail && <div className="text-danger">{errorEmail}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">
                            Địa chỉ
                        </label>
                        <textarea
                            className="form-control"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="gender" className="form-label">
                            Giới tính
                        </label>
                        <select
                            className="form-control"
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="true">Nam</option>
                            <option value="false">Nữ</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="roleId" className="form-label">
                            Quyền
                        </label>
                        <select
                            className="form-control"
                            id="roleId"
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn quyền</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="file" className="form-label">
                            Ảnh đại diện
                        </label>
                        <input type="file" className="form-control" id="file" name="file" onChange={handleChange} />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    <Link to="/admin/user" className="btn btn-secondary">
                        Trở lại
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) : (
                            'Thêm'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddUser;
