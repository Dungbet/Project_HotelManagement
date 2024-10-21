import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { differenceInDays, parse, format } from 'date-fns'; // Import hàm cần thiết từ date-fns

function Booking() {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        price: '',
        guestCount: '',
        id: '',
        checkinDate: '',
        checkoutDate: '',
        name: '',
        phoneNumber: '',
        email: '',
        couponCode: '',
        discountedPrice: '',
        paymentMethod: '',
    });
    const [discount, setDiscount] = useState(0);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token');

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
                setFormData((prevData) => ({
                    ...prevData,
                    name: response.data.name || '',
                    phoneNumber: response.data.phoneNumber || '',
                    email: response.data.email || '',
                }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
                navigate('/login'); // Redirect to login if not authenticated
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();

        const queryParams = new URLSearchParams(location.search);
        setFormData((prevData) => ({
            ...prevData,
            id: queryParams.get('id'),
            price: queryParams.get('price') || '',
            guestCount: queryParams.get('guests') || '',
            checkinDate: queryParams.get('checkinDate') || '',
            checkoutDate: queryParams.get('checkoutDate') || '',
        }));
    }, [location.search, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    const handleApplyCoupon = async () => {
        if (!formData.couponCode.trim()) {
            setErrorMessage('');
            setSuccessMessage('');
            setDiscount(0);
            setFormData((prevData) => ({
                ...prevData,
                discountedPrice: formData.price,
            }));
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/coupon/code?code=${formData.couponCode}`);
            if (response.data.status === 200) {
                const coupon = response.data.data;
                const originalPrice = parseFloat(formData.price);
                const totalAmount = originalPrice * numberOfNights; // Tổng tiền cho số đêm

                // Tính số tiền giảm giá chính xác
                const discountAmount = (coupon.discountPercentage / 100) * totalAmount;
                setDiscount(discountAmount);

                // Tính toán giá cuối cùng sau khi giảm
                setFormData((prevData) => ({
                    ...prevData,
                    discountedPrice: (totalAmount - discountAmount).toFixed(2), // Cập nhật giá trị
                }));
                setSuccessMessage('Áp dụng mã thành công');
                setErrorMessage('');
            } else {
                setErrorMessage('Mã giảm giá sai hoặc đã hết hạn!');
                setSuccessMessage('');
                setDiscount(0);
                setFormData((prevData) => ({
                    ...prevData,
                    discountedPrice: totalAmount.toFixed(2), // Đảm bảo giá không đổi nếu mã không hợp lệ
                }));
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            setErrorMessage('Mã giảm giá sai hoặc đã hết hạn!');
            setSuccessMessage('');
            setDiscount(0);
            setFormData((prevData) => ({
                ...prevData,
                discountedPrice: totalAmount.toFixed(2), // Đảm bảo giá không đổi nếu có lỗi
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra lỗi từ input
        const validationErrors = {};
        if (!formData.name) {
            validationErrors.name = 'Tên là bắt buộc';
        }
        if (!formData.phoneNumber) {
            validationErrors.phoneNumber = 'Số điện thoại là bắt buộc';
        }
        if (!formData.email) {
            validationErrors.email = 'Email là bắt buộc';
        }
        if (!formData.paymentMethod) {
            validationErrors.paymentMethod = 'Chọn phương thức thanh toán là bắt buộc';
        }

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        // Parsing check-in và check-out dates
        const checkinDate = parse(formData.checkinDate, 'dd/MM/yyyy', new Date());
        const checkoutDate = parse(formData.checkoutDate, 'dd/MM/yyyy', new Date());

        const numberOfNights = differenceInDays(checkoutDate, checkinDate);
        const originalPrice = parseFloat(formData.price) || 0;

        // Tính tổng tiền dựa trên số đêm
        const totalAmount = numberOfNights * originalPrice;

        // Tính số tiền sau khi giảm giá (nếu có)
        const finalAmount = parseFloat(formData.discountedPrice) || totalAmount;

        const bookingData = {
            checkInDate: format(checkinDate, 'dd/MM/yyyy'),
            checkOutDate: format(checkoutDate, 'dd/MM/yyyy'),
            totalAmount: finalAmount, // Sử dụng giá cuối cùng sau khi đã giảm giá
            guest: parseInt(formData.guestCount, 10) || 0,
            status: false,
            bookingName: formData.name,
            bookingEmail: formData.email,
            bookingPhone: formData.phoneNumber,
            room: {
                id: formData.id,
            },
        };

        try {
            const createBookingResponse = await axios.post('http://localhost:8080/booking/create', bookingData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (createBookingResponse.data.status === 200) {
                const response = await axios.get('http://localhost:8080/api/payment/create-payment', {
                    params: {
                        amount: finalAmount, // Sử dụng giá sau khi đã giảm giá
                        bookingId: createBookingResponse.data.data.id,
                    },
                });

                if (response.data.code === '00') {
                    window.location.href = response.data.data; // Chuyển hướng đến trang thanh toán
                } else {
                    alert('Thanh toán không thành công');
                }
            } else {
                alert('Lỗi khi tạo đặt phòng. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error during booking creation or payment creation:', error);
            alert('Lỗi khi tạo đặt phòng hoặc thanh toán. Vui lòng thử lại.');
        }
    };

    const originalPrice = parseFloat(formData.price);
    const discountAmount = discount;
    const checkinDate = parse(formData.checkinDate, 'dd/MM/yyyy', new Date());
    const checkoutDate = parse(formData.checkoutDate, 'dd/MM/yyyy', new Date());
    const numberOfNights = differenceInDays(checkoutDate, checkinDate);
    const totalAmount = numberOfNights * originalPrice;

    const finalPrice = (totalAmount - discountAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <div id="booking">
            <div className="container">
                <div className="left-form">
                    <div className="section-header">
                        <h2>Đặt Phòng</h2>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="booking-form">
                                <div id="success"></div>
                                <form name="sentMessage" id="bookingForm" noValidate onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="control-group col-md-6">
                                            <label htmlFor="name">Tên</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                placeholder="VD: Tạ Quang Dũng"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.name && <p className="help-block text-danger">{errors.name}</p>}
                                        </div>
                                        <div className="control-group col-md-6">
                                            <label htmlFor="guestCount">Số người</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="guestCount"
                                                value={formData.guestCount}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="control-group col-md-6">
                                            <label htmlFor="phoneNumber">Số điện thoại</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="phoneNumber"
                                                placeholder=""
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.phoneNumber && (
                                                <p className="help-block text-danger">{errors.phoneNumber}</p>
                                            )}
                                        </div>
                                        <div className="control-group col-md-6">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                placeholder=""
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.email && <p className="help-block text-danger">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="control-group col-md-6">
                                            <label htmlFor="checkinDate">Check-In</label>
                                            <input
                                                type="text"
                                                className="form-control datetimepicker-input"
                                                id="checkinDate"
                                                value={formData.checkinDate}
                                                readOnly
                                            />
                                        </div>
                                        <div className="control-group col-md-6">
                                            <label htmlFor="checkoutDate">Check-Out</label>
                                            <input
                                                type="text"
                                                className="form-control datetimepicker-input"
                                                id="checkoutDate"
                                                value={formData.checkoutDate}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="control-group col-md-12">
                                            <label htmlFor="roomId">ID Phòng</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="roomId"
                                                value={formData.id}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-form">
                    <div className="form-group">
                        <label htmlFor="couponCode">Mã giảm giá</label>
                        <input
                            type="text"
                            className="form-control"
                            id="couponCode"
                            name="couponCode"
                            value={formData.couponCode}
                            onChange={handleChange}
                        />
                        {errorMessage && <p className="text-danger">{errorMessage}</p>}
                        {successMessage && <p className="text-success">{successMessage}</p>}
                        <button type="button" onClick={handleApplyCoupon} className="btn btn-primary">
                            Áp dụng
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Tổng Tiền</label>
                        <div>
                            {discount > 0 && (
                                <>
                                    <div className="price-item">
                                        <span className="price-label">Tổng tiền ({numberOfNights} đêm):</span>
                                        <span className="price-value">
                                            {totalAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{' '}
                                            VNĐ
                                        </span>
                                    </div>
                                    <div className="price-item">
                                        <span className="price-label">Voucher giảm giá:</span>
                                        <span className="price-value">
                                            -{' '}
                                            {discountAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{' '}
                                            VNĐ
                                        </span>
                                    </div>
                                    <div className="price-item final-price">
                                        <span className="price-label">Tổng:</span>
                                        <span className="price-value final-price">{finalPrice} VNĐ</span>
                                    </div>
                                </>
                            )}
                            {discount === 0 && (
                                <div className="price-item">
                                    <span className="price-label">Tổng ({numberOfNights} đêm):</span>
                                    <span className="price-value final-price">
                                        {totalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}{' '}
                                        VNĐ
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="paymentMethod">Phương thức thanh toán</label>
                        <select
                            className="form-select"
                            aria-label="Default select example"
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn phương thức thanh toán</option>
                            <option value="1">Thanh toán online</option>
                        </select>
                        {errors.paymentMethod && <p className="help-block text-danger">{errors.paymentMethod}</p>}
                    </div>

                    <div className="button">
                        <button type="submit" className="btn btn-dark" onClick={handleSubmit}>
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking;