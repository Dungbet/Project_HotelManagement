import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // New state for loading

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading to true when starting the request
        try {
            const response = await axios.post(
                'http://localhost:8080/auth/forget-password',
                { email },
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            // Assuming a successful response returns status 200
            if (response.status === 200) {
                setMessage(response.data.data); // Get the success message from `data`
                // Clear any previous errors
            }
        } catch (error) {
            // Handle error based on the error response
            if (error.response) {
                // Error response exists
                if (error.response.data.status === 400) {
                    setError(error.response.data.data || 'Có lỗi xảy ra. Vui lòng thử lại.'); // Adjusted for potential `message` field
                } else {
                    setError('Có lỗi xảy ra. Vui lòng thử lại.');
                }
                setMessage(''); // Clear any previous messages
            } else {
                // No response, possibly a network error
                setError('Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng của bạn.');
                setMessage(''); // Clear any previous messages
            }
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
                                    <div className="col-md-6 col-lg-5 d-none d-md-block ">
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
                                                    Nhập email của bạn
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
                                                        onChange={handleEmailChange}
                                                        required
                                                    />
                                                    {error && <div className="text-danger mt-2">{error}</div>}{' '}
                                                    {/* Display error here */}
                                                </div>
                                                <div className="pt-1 mb-4">
                                                    <button
                                                        className="btn btn-dark btn-lg btn-block w-100"
                                                        type="submit"
                                                        disabled={loading} // Disable the button while loading
                                                        style={{ backgroundColor: '#dfa974' }}
                                                    >
                                                        {loading ? (
                                                            <div className="spinner-border text-light" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        ) : (
                                                            'Khôi phục lại mật khẩu'
                                                        )}
                                                    </button>
                                                </div>
                                                {message && (
                                                    <div className="alert alert-info" role="alert">
                                                        {message}
                                                    </div>
                                                )}
                                                <p className="mb-5 pb-lg-2">
                                                    Bạn muốn quay trở lại?{' '}
                                                    <Link to="/login" style={{ color: '#dfa974' }}>
                                                        Đăng nhập
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

export default ForgotPassword;
