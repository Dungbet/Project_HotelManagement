import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorEmail, setErrorEmail] = useState('');
    const [errorUsername, setErrorUsername] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // New state for loading

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        setLoading(true); // Set loading to true when starting the request

        try {
            const response = await axios.post('http://localhost:8080/auth/register', { email, username, password });
            setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản');
            setError('');
            setErrorEmail('');
            setErrorUsername('');
            setEmail('');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            const { data } = err.response;
            setError('');
            setErrorEmail('');
            setErrorUsername('');

            // Handle the specific error message from the backend
            if (data.msg) {
                if (data.msg.includes('Email đã tồn tại')) {
                    setErrorEmail('Email đã tồn tại');
                } else if (data.msg.includes('Username đã tồn tại')) {
                    setErrorUsername('Tên đăng nhập đã tồn tại');
                } else {
                    setError(data.msg);
                }
            } else {
                setError('Có lỗi xảy ra.');
            }
            setSuccess('');
        } finally {
            setLoading(false); // Set loading to false after the request completes
        }
    };

    return (
        <>
            <section className="vh-100" style={{ backgroundColor: '#f0f2f5' }}>
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
                                            <form onSubmit={handleSubmit}>
                                                <div className="d-flex align-items-center mb-3 pb-1">
                                                    <span className="h1 fw-bold mb-0" style={{ color: '#dfa974' }}>
                                                        Khách Sạn Luxe Oasis
                                                    </span>
                                                </div>
                                                <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px' }}>
                                                    Tạo tài khoản để đăng nhập
                                                </h5>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        className="form-control form-control-lg"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                    {errorEmail && <div className="text-danger">{errorEmail}</div>}
                                                </div>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="username">
                                                        Tên đăng nhập
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        className="form-control form-control-lg"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                    {errorUsername && (
                                                        <div className="text-danger">{errorUsername}</div>
                                                    )}
                                                </div>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="password">
                                                        Mật khẩu
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        className="form-control form-control-lg"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="confirmPassword">
                                                        Nhập lại mật khẩu
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        className="form-control form-control-lg"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {error && <div className="alert alert-danger">{error}</div>}
                                                {success && <div className="alert alert-success">{success}</div>}
                                                <div className="pt-1 mb-4">
                                                    <button
                                                        className="btn btn-primary btn-lg btn-block w-100 text-white"
                                                        type="submit"
                                                        disabled={loading} // Disable the button while loading
                                                        style={{ backgroundColor: '#dfa974' }}
                                                    >
                                                        {loading ? (
                                                            <div className="spinner-border text-light" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        ) : (
                                                            'Đăng kí'
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="mb-5 pb-lg-2">
                                                    Bạn đã có tài khoản?{' '}
                                                    <a href="/login" style={{ color: '#dfa974' }}>
                                                        Đăng nhập
                                                    </a>
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

export default Signup;
