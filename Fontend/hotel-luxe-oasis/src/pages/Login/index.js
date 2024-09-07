import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Hook for navigation

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/login', { username, password });

            // Giải nén dữ liệu từ phản hồi
            const { status, data } = response.data;

            if (status === 200) {
                // Đăng nhập thành công
                localStorage.setItem('token', data); // Lưu token
                localStorage.setItem('username', username); // Lưu tên đăng nhập
                navigate('/'); // Chuyển hướng đến trang chính
            } else if (status === 401) {
                // Đăng nhập thất bại
                setError('Username hoặc mật khẩu không đúng');
            }
        } catch (err) {
            // Xử lý lỗi không mong muốn
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="vh-100">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col col-xl-10">
                            <div
                                className="card"
                                style={{
                                    borderRadius: '1rem',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)',
                                }}
                            >
                                <div className="row g-0">
                                    <div className="col-md-6 col-lg-5 d-none d-md-block">
                                        <img
                                            src="img/Logo_hotel.jpg"
                                            alt="login form"
                                            className="img-fluid h-100"
                                            style={{ borderRadius: '1rem 0 0 1rem' }}
                                        />
                                    </div>
                                    <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                        <div className="card-body p-4 p-lg-5 text-black">
                                            <form onSubmit={handleLogin}>
                                                <div className="d-flex align-items-center mb-3 pb-1">
                                                    <span className="h1 fw-bold mb-0" style={{ color: '#dfa974' }}>
                                                        Khách Sạn Luxe Oasis
                                                    </span>
                                                </div>
                                                <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px' }}>
                                                    Đăng nhập vào tài khoản của bạn
                                                </h5>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="form2Example17">
                                                        Tên đăng nhập
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="form2Example17"
                                                        className="form-control form-control-lg"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="form2Example27">
                                                        Mật khẩu
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="form2Example27"
                                                        className="form-control form-control-lg"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {error && <div className="alert alert-danger">{error}</div>}
                                                <div className="pt-1 mb-4">
                                                    <button
                                                        className="btn btn-lg btn-block w-100 text-white"
                                                        type="submit"
                                                        disabled={loading}
                                                        style={{ backgroundColor: '#dfa974' }}
                                                    >
                                                        {loading ? (
                                                            <div className="spinner-border text-light" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        ) : (
                                                            'Đăng nhập'
                                                        )}
                                                    </button>
                                                </div>
                                                <p>
                                                    <Link
                                                        to="/forget-password"
                                                        className="small"
                                                        style={{ color: '#dfa974' }}
                                                    >
                                                        Quên mật khẩu?
                                                    </Link>
                                                </p>
                                                <p className="mb-5 pb-lg-2">
                                                    Bạn chưa có tài khoản?{' '}
                                                    <Link to="/signup" style={{ color: '#dfa974' }}>
                                                        Đăng kí
                                                    </Link>
                                                </p>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;
