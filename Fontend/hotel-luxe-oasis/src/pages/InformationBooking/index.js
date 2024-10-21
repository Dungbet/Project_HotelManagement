import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parse, parseISO } from 'date-fns'; // Corrected import statement

function InformationBooking() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage

            if (!token) {
                navigate('/login'); // Redirect to login page if no token
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/booking/bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookings(response.data.data);
            } catch (err) {
                setError('Không thể lấy dữ liệu đặt phòng.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const formatDate = (dateString) => {
        try {
            const parsedDate = parseISO(dateString); // parse ISO string to Date object
            return format(parsedDate, 'dd/MM/yyyy HH:mm'); // format as "Ngày/Tháng/Năm Giờ:Phút"
        } catch (e) {
            console.error('Date parsing error:', e);
            return 'N/A';
        }
    };

    // Helper function to parse date string
    const parseDate = (dateString) => {
        try {
            return format(parse(dateString, 'dd/MM/yyyy', new Date()), 'dd/MM/yyyy');
        } catch (e) {
            console.error('Date parsing error:', e);
            return 'N/A';
        }
    };

    const renderStatus = (status) => {
        if (status) {
            return <span style={{ color: 'green' }}>Đã thanh toán</span>;
        } else {
            return <span style={{ color: 'red' }}>Thanh toán không thành công</span>;
        }
    };

    return (
        <div className="container">
            <h2 className="text-center my-4">Danh Sách Phòng Đã Đặt</h2>
            <table className="table table-bordered table-hover order-table">
                <thead className="thead-dark">
                    <tr>
                        <th>Ngày đặt</th>
                        <th>Tên người đặt</th>
                        <th>Phòng số</th>
                        <th>SĐT</th>
                        <th>Email</th>
                        <th>Số người</th>
                        <th>Ngày check-in</th>
                        <th>Ngày check-out</th>
                        <th>Tổng tiền</th>
                        <th>Trạng Thái</th>
                    </tr>
                </thead>
                <tbody id="order_list">
                    {bookings.length > 0 ? (
                        bookings.map((booking, index) => (
                            <tr key={index}>
                                <td>{formatDate(booking.createAt) || 'N/A'}</td> {/* Format createAt */}
                                <td>{booking.bookingName || 'N/A'}</td>
                                <td>{booking.room ? booking.room.roomNumber : 'N/A'}</td>
                                <td>{booking.bookingPhone || 'N/A'}</td>
                                <td>{booking.bookingEmail || 'N/A'}</td>
                                <td>{booking.guest}</td>
                                <td>{parseDate(booking.checkInDate)}</td>
                                <td>{parseDate(booking.checkOutDate)}</td>
                                <td>
                                    {booking.totalAmount.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </td>
                                <td>{renderStatus(booking.status)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default InformationBooking;
