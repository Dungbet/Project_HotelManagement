import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [formErrors, setFormErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [success, setSuccess] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login'); // Redirect to login page if not authenticated
        } else {
            // Fetch the username from /auth/me
            axios
                .get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setUsername(response.data.username);
                })
                .catch((error) => {
                    console.error('Error fetching username:', error);
                    navigate('/admin/login'); // Redirect to login if there's an error
                });
        }
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '', // Clear the error when the user starts typing
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { currentPassword, newPassword, confirmNewPassword } = formData;

        let errors = {};
        if (!currentPassword) {
            errors.currentPassword = 'Vui lòng nhập mật khẩu cũ.';
        }
        if (!newPassword) {
            errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
        }
        if (newPassword !== confirmNewPassword) {
            errors.confirmNewPassword = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await axios.put('http://localhost:8080/user/change-password', null, {
                params: {
                    username: username, // Use the fetched username
                    oldPassword: currentPassword,
                    newPassword: newPassword,
                },
                headers: {
                    Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
                },
            });

            if (response.data.status === 200) {
                setSuccess('Mật khẩu đã được cập nhật thành công.');
                setFormErrors({});
                setTimeout(() => {
                    navigate('/login'); // Redirect to the login page after 2 seconds
                }, 2000);
            } else {
                setFormErrors({ currentPassword: response.data.msg || 'Có lỗi xảy ra.' });
            }
        } catch (error) {
            setFormErrors({ currentPassword: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        }
    };

    return (
        <div className="custom-password-change-container">
            <h2>Đổi Mật Khẩu</h2>
            <form id="customPasswordChangeForm" onSubmit={handleSubmit}>
                {success && <div className="custom-success-message">{success}</div>}

                <div className="custom-form-group">
                    <label htmlFor="customCurrentPassword">Mật khẩu cũ</label>
                    <input
                        type="password"
                        id="customCurrentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                    {formErrors.currentPassword && (
                        <div className="custom-error-message">{formErrors.currentPassword}</div>
                    )}
                </div>

                <div className="custom-form-group">
                    <label htmlFor="customNewPassword">Mật khẩu mới</label>
                    <input
                        type="password"
                        id="customNewPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                    {formErrors.newPassword && <div className="custom-error-message">{formErrors.newPassword}</div>}
                </div>

                <div className="custom-form-group">
                    <label htmlFor="customConfirmNewPassword">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        id="customConfirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                    />
                    {formErrors.confirmNewPassword && (
                        <div className="custom-error-message">{formErrors.confirmNewPassword}</div>
                    )}
                </div>

                <button type="submit" className="custom-btn-submit" style={{ backgroundColor: '#007bff' }}>
                    Đổi mật khẩu
                </button>
            </form>
        </div>
    );
}

export default ChangePassword;
