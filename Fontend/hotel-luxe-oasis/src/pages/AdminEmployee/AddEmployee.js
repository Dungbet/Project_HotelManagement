import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
        roleId: '3', // ID của role
        enable: true,
        file: null,
    });
    const [errorEmail, setErrorEmail] = useState('');
    const [errorUsername, setErrorUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // New state for loading
    const [role, setRole] = useState(null);

    const getToken = () => localStorage.getItem('token');
    const navigate = useNavigate();

    // Giải mã token để lấy role
    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);

                setRole(decoded.role); // Lấy giá trị 'sub' từ payload
                return decoded.userId;
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };
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
        decodeToken();
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
        setLoading(true); // Set loading to true khi bắt đầu request

        // Kiểm tra các trường dữ liệu trước khi gửi
        if (
            !formData.name ||
            !formData.username ||
            !formData.password ||
            !formData.phoneNumber ||
            !formData.email ||
            !formData.address
        ) {
            setError('Vui lòng điền đầy đủ thông tin!');
            setLoading(false);
            return;
        }
        let response;
        // Nếu tất cả các trường hợp đã được nhập đủ, tiếp tục gửi yêu cầu
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('username', formData.username);
            data.append('password', formData.password);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('email', formData.email);
            data.append('address', formData.address);
            data.append('gender', formData.gender);
            data.append('role.id', formData.roleId);
            data.append('enable', formData.enable); // Gửi trạng thái kích hoạt
            if (formData.file) {
                data.append('file', formData.file);
            }

            const token = getToken();

            // Kiểm tra quyền của người dùng
            if (role === 'manager') {
                const managerId = decodeToken();
                // Gọi API create-employee cho manager
                response = await axios.post('http://localhost:8080/admin/user/create-employee', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                    params: { managerId: managerId },
                });
            } else if (role === 'admin') {
                // Gọi API create cho admin
                response = await axios.post('http://localhost:8080/admin/user/create', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            // Kiểm tra phản hồi có thông báo lỗi không
            const responseData = response.data;
            if (responseData.msg) {
                if (responseData.msg.includes('Email đã tồn tại')) {
                    setErrorEmail('Email đã tồn tại');
                    setErrorUsername(''); // Clear lỗi tên tài khoản
                } else if (responseData.msg.includes('Tên tài khoản đã tồn tại')) {
                    setErrorUsername('Tên tài khoản đã tồn tại');
                    setErrorEmail(''); // Clear lỗi email
                } else {
                    // Điều hướng đến trang người dùng dựa trên vai trò
                    if (role === 'admin') {
                        navigate('/admin/employee');
                    } else if (role === 'manager') {
                        navigate('/manager/employee');
                    } else {
                        navigate('/login'); // Default fallback
                    }
                }
                setLoading(false);
                return;
            }

            // Nếu không có lỗi, điều hướng tới trang người dùng
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Có lỗi xảy ra.');
        } finally {
            setLoading(false); // Set loading to false sau khi request hoàn tất
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Thêm Nhân Viên</h6>
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

                    {/* <div className="mb-3">
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
                    </div> */}

                    <div className="mb-3">
                        <label htmlFor="file" className="form-label">
                            Ảnh đại diện
                        </label>
                        <input type="file" className="form-control" id="file" name="file" onChange={handleChange} />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    <Link
                        to={role === 'admin' ? '/admin/employee' : role === 'manager' ? '/manager/employee' : '/login'}
                        className="btn btn-secondary"
                    >
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
