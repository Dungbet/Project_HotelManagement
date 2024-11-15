import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns'; // Import các hàm cần thiết từ date-fns

function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [status, setStatus] = useState('');
    const [txnRef, setTxnRef] = useState('');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage

        if (!token) {
            navigate('/login'); // Redirect to login page if no token
            return;
        }
        // Read parameters from URL
        const queryParams = new URLSearchParams(location.search);
        setOrderId(queryParams.get('bookingId') || '');
        setTotalPrice(queryParams.get('vnp_Amount') || '');
        setTxnRef(queryParams.get('vnp_TxnRef') || '');
        const rawDate = queryParams.get('vnp_PayDate') || '';
        if (rawDate) {
            // Parse date string and format it
            const formattedDate = format(parse(rawDate, 'yyyyMMddHHmmss', new Date()), 'HH:mm:ss dd/MM/yyyy');
            setPaymentDate(formattedDate);
        } else {
            setPaymentDate('');
        }

        setStatus(queryParams.get('vnp_TransactionStatus'));
    }, [location.search, navigate]);

    useEffect(() => {
        // Call backend to handle the payment information if status is successful
        if (status === '00') {
            axios
                .get(`http://localhost:8080/api/payment/payment-infor`, {
                    params: {
                        vnp_Amount: totalPrice,
                        vnp_PayDate: paymentDate,
                        vnp_TransactionStatus: status,
                        bookingId: orderId,
                    },
                })
                .then((response) => {
                    console.log('Payment info updated successfully', response.data);
                })
                .catch((error) => {
                    console.error('There was an error updating payment info!', error);
                });
        }
        axios
            .get(`http://localhost:8080/booking/search`, {
                params: { id: orderId },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then((response) => {
                const data = response.data.data;
                // Ensure dates are parsed correctly
                if (data) {
                    data.checkInDate = parse(data.checkInDate, 'dd/MM/yyyy', new Date());
                    data.checkOutDate = parse(data.checkOutDate, 'dd/MM/yyyy', new Date());
                }
                setBookingDetails(data);
            })
            .catch((error) => {
                console.error('There was an error!', error);
            })
            .finally(() => setLoading(false));
    }, [status, orderId, totalPrice, paymentDate]);

    return (
        <div className="container mt-4">
            <h2 className="text-center">Chi tiết đặt phòng</h2>
            <h4 className="mt-4">Thông tin đặt phòng</h4>
            <div>
                <hr />
                <dl className="row">
                    <dt className="col-sm-3">Mã giao dịch</dt>
                    <dd className="col-sm-9">{txnRef}</dd>

                    <dt className="col-sm-3">Tổng tiền</dt>
                    <dd className="col-sm-9">{totalPrice / 100}</dd>

                    <dt className="col-sm-3">Ngày thanh toán</dt>
                    <dd className="col-sm-9">{paymentDate}</dd>

                    <dt className="col-sm-3">Trạng thái</dt>
                    <dd className="col-sm-9">{status === '00' ? 'Thành công' : 'Thất bại'}</dd>
                </dl>
            </div>
            <h4 className="mt-4">Phòng Booking</h4>
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>Tên người đặt</th>
                        <th>Phòng số</th>
                        <th>SĐT</th>
                        <th>Email</th>
                        <th>Số người</th>
                        <th>Ngày check-in</th>
                        <th>Ngày check-out</th>
                        <th>Tổng tiền</th>
                    </tr>
                </thead>
                <tbody id="order_items">
                    {bookingDetails ? (
                        <tr>
                            <td>{bookingDetails.bookingName || 'N/A'}</td>
                            <td>{bookingDetails.room.roomNumber || 'N/A'}</td>
                            <td>{bookingDetails.bookingPhone || 'N/A'}</td>
                            <td>{bookingDetails.bookingEmail || 'N/A'}</td>
                            <td>{bookingDetails.guest}</td>
                            <td>
                                {bookingDetails.checkInDate
                                    ? new Date(bookingDetails.checkInDate).toLocaleDateString('vi-VN')
                                    : 'N/A'}
                            </td>
                            <td>
                                {bookingDetails.checkOutDate
                                    ? new Date(bookingDetails.checkOutDate).toLocaleDateString('vi-VN')
                                    : 'N/A'}
                            </td>

                            <td>{bookingDetails.totalAmount.toLocaleString()}</td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan="8">Loading...</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <p className="mt-4">
                <a href="/rooms" className="btn btn-primary">
                    Trở lại đặt phòng
                </a>
            </p>
        </div>
    );
}

export default Payment;
