import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';

function EditPayment() {
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        paymentDate: '',
        amount: '',
        paymentMethod: '',
        bookingId: '',
    });

    const navigate = useNavigate();
    const { id } = useParams(); // Lấy id của payment từ URL

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/admin/payment/${id}`);
                const paymentData = response.data.data;
                setFormData({
                    paymentDate: paymentData.paymentDate,
                    amount: paymentData.amount,
                    paymentMethod: paymentData.paymentMethod,
                    bookingId: paymentData.booking.id,
                });
            } catch (error) {
                console.error('Error fetching payment', error);
            }
        };

        const fetchBookings = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/booking/');
                if (Array.isArray(response.data.data)) {
                    setBookings(response.data.data);
                } else {
                    console.error('API did not return an array for bookings', response.data);
                }
            } catch (error) {
                console.error('Error fetching bookings', error);
            }
        };

        fetchPayment();
        fetchBookings();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(`http://localhost:8080/admin/payment/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Payment updated successfully:', response.data);
            navigate('/admin/payment');
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Chỉnh Sửa Thanh Toán</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="paymentDate" className="form-label">
                            Ngày thanh toán
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="paymentDate"
                            name="paymentDate"
                            value={formData.paymentDate}
                            onChange={handleChange}
                            required
                        />
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
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="paymentMethod" className="form-label">
                            Phương thức thanh toán
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="bookingId" className="form-label">
                            Đặt chỗ
                        </label>
                        <select
                            className="form-control"
                            id="bookingId"
                            name="bookingId"
                            value={formData.bookingId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn đặt chỗ</option>
                            {bookings.map((booking) => (
                                <option key={booking.id} value={booking.id}>
                                    {booking.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Link to="/admin/payment" className="btn btn-secondary">
                        Trở lại
                    </Link>
                    <button type="submit" className="btn btn-primary">
                        Cập nhật
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditPayment;
