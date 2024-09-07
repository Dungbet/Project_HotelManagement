import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [statuslogin, setStatuslogin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/login', {
                username,
                password,
            });

            const { status, data } = response.data;

            if (status === 200) {
                // Lưu token vào localStorage
                localStorage.setItem('token', data); // Lưu token từ API

                // Gửi yêu cầu xác thực để lấy thông tin người dùng
                const userResponse = await axios.get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${data}`,
                    },
                });

                const userData = userResponse.data;

                if (userData.role.name === 'ROLE_ADMIN') {
                    navigate('/admin/'); // Redirect to admin page
                } else {
                    localStorage.removeItem('token'); // Xóa token nếu không phải admin
                    setStatuslogin('Bạn không có quyền truy cập');
                }
            } else if (status === 401) {
                // Đăng nhập thất bại
                setStatuslogin('Username hoặc mật khẩu không đúng');
            }
        } catch (error) {
            console.error('Login Error:', error.response?.data || error.message);
            setStatuslogin('Lỗi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row h-100 align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                    <div className="bg-light rounded p-4 p-sm-5 my-4 mx-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <a href="index.html" className="">
                                <h3 className="text-primary">
                                    <i className="fa fa-hashtag me-2"></i>Luxe Oasis
                                </h3>
                            </a>
                            <h3>Đăng Nhập</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingInput"
                                    placeholder="Tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <label htmlFor="floatingInput">Tên đăng nhập</label>
                            </div>
                            <div className="form-floating mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    id="floatingPassword"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="floatingPassword">Mật khẩu</label>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                                    <label className="form-check-label" htmlFor="exampleCheck1">
                                        Nhớ mật khẩu
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary py-3 w-100 mb-4" disabled={loading}>
                                {loading ? (
                                    <div className="spinner-border text-light" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    'Đăng Nhập'
                                )}
                            </button>
                        </form>
                        {statuslogin && (
                            <div className="alert alert-danger" role="alert">
                                {statuslogin}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
