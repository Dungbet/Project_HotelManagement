import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function AddPayment() {
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: '',
        bookingId: '', // ID của booking
        status: 'Đã thanh toán',
    });

    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = getToken();
                const response = await axios.get('http://localhost:8080/booking/get-all', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('API Response:', response.data); // Log toàn bộ response để kiểm tra cấu trúc dữ liệu
                if (response.data.status === 200) {
                    // Lọc các booking có status là false (Chưa thanh toán)
                    const filteredBookings = response.data.data.filter((booking) => {
                        return booking.status === 'Chưa thanh toán'; // Điều chỉnh tùy thuộc vào giá trị trả về
                    });
                    console.log('Filtered Bookings:', filteredBookings); // Log các booking đã lọc
                    setBookings(filteredBookings);
                } else {
                    console.error('API returned an unexpected status', response.data);
                }
            } catch (error) {
                console.error('Error fetching bookings', error);
            }
        };

        fetchBookings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        // Cập nhật số tiền khi chọn booking
        if (name === 'bookingId') {
            const booking = bookings.find((b) => b.id === parseInt(value));
            if (booking) {
                setFormData((prevState) => ({
                    ...prevState,
                    amount: booking.totalAmount,
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = getToken();
            const response = await axios.post(
                'http://localhost:8080/admin/payment/create',
                {
                    paymentDate: new Date().toISOString(), // Gán ngày thanh toán là thời điểm hiện tại
                    amount: formData.amount,
                    paymentMethod: formData.paymentMethod,

                    booking: {
                        id: parseInt(formData.bookingId), // Chuyển đổi bookingId thành số nguyên và gán vào đối tượng booking
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            console.log('Payment added successfully:', response.data);

            navigate('/admin/payment');
        } catch (error) {
            console.error('Error adding payment:', error);
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Thêm Thanh Toán</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="bookingId" className="form-label">
                            ID Đặt Phòng
                        </label>
                        <select
                            className="form-control"
                            id="bookingId"
                            name="bookingId"
                            value={formData.bookingId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn ID Đặt Phòng</option>
                            {bookings.map((booking) => (
                                <option key={booking.id} value={booking.id}>
                                    {booking.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="amount" className="form-label">
                            Số tiền
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            readOnly // Chỉ đọc, không cho phép chỉnh sửa
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="paymentMethod" className="form-label">
                            Phương thức thanh toán
                        </label>
                        <select
                            className="form-control"
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn phương thức thanh toán</option>
                            <option value="Chuyển khoản">Chuyển khoản</option>
                            <option value="Tiền Mặt">Tiền Mặt</option>
                        </select>
                    </div>

                    <Link to="/admin/payment" className="btn btn-secondary">
                        Trở lại
                    </Link>
                    <button type="submit" className="btn btn-primary">
                        Thêm
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddPayment;
