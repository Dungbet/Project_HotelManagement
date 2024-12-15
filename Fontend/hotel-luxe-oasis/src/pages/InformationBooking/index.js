import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, parse } from 'date-fns';
import SuccessDialog from './SuccessDialog';

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

function InformationBooking() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [userReviews, setUserReviews] = useState({});
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isReviewed, setIsReviewed] = useState(false);
    const [roomReviewStatus, setRoomReviewStatus] = useState({});
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const navigate = useNavigate();

    const checkReviewStatus = async (bookingId, roomId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/review/exists?bookingId=${bookingId}&roomId=${roomId}`,
            );
            setRoomReviewStatus((prevStatus) => ({
                ...prevStatus,
                [`${bookingId}-${roomId}`]: response.data, // Gắn bookingId và roomId để đảm bảo duy nhất
            }));
        } catch (error) {
            console.error('Error fetching review status:', error);
        }
    };

    useEffect(() => {
        const fetchReviewStatuses = async () => {
            for (const booking of bookings) {
                if (booking.bookingStatus === 'Hoàn thành') {
                    for (const room of booking.rooms || []) {
                        await checkReviewStatus(booking.id, room.id); // Gọi từng phòng
                    }
                }
            }
        };

        if (bookings.length > 0) {
            fetchReviewStatuses();
        }
    }, [bookings]);

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
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

    const handleReviewSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token || !selectedRoomId || !rating || !reviewText) {
            setReviewError('Vui lòng chọn sao, nhập nội dung đánh giá và đảm bảo bạn đã đăng nhập.');
            return;
        }

        const reviewData = {
            rating,
            comment: reviewText,
            booking: { id: currentBookingId },
            room: { id: selectedRoomId },
        };

        try {
            await axios.post('http://localhost:8080/review/create', reviewData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Cập nhật trạng thái `roomReviewStatus` để phản ánh rằng phòng đã được đánh giá
            setRoomReviewStatus((prevStatus) => ({
                ...prevStatus,
                [`${currentBookingId}-${selectedRoomId}`]: true,
            }));

            setReviewModalOpen(false);
            setReviewSuccess(true);
            setReviewError('');
            setSuccessDialogOpen(true); // Hiển thị dialog thành công
            setSuccessMessage('Đánh giá thành công!');
        } catch (error) {
            setReviewError('Đã có lỗi xảy ra khi gửi đánh giá.');
        }
    };

    const formatDate = (dateString) => {
        try {
            const parsedDate = parseISO(dateString);
            return format(parsedDate, 'dd/MM/yyyy HH:mm');
        } catch (e) {
            console.error('Date parsing error:', e);
            return 'N/A';
        }
    };

    const parseDate = (dateString) => {
        try {
            return format(parse(dateString, 'dd/MM/yyyy', new Date()), 'dd/MM/yyyy');
        } catch (e) {
            console.error('Date parsing error:', e);
            return 'N/A';
        }
    };
    const handleOpenReviewModal = (roomId, bookingId) => {
        setSelectedRoomId(roomId);
        setCurrentBookingId(bookingId);
        setRating(0); // Reset số sao
        setReviewText(''); // Reset nội dung đánh giá
        setReviewSuccess(false); // Ẩn trạng thái thành công
        setReviewError(''); // Xóa lỗi
        setReviewModalOpen(true);
    };

    const handleViewReview = (roomId) => {
        navigate(`/room-detail/${roomId}`);
    };

    // Modify the handleCancelBooking function
    const handleCancelBooking = async (bookingId) => {
        const token = localStorage.getItem('token');
        const booking = bookings.find((b) => b.id === bookingId);

        if (!token || !booking) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/booking/request-cancel', booking, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBookings((prevBookings) => prevBookings.map((b) => (b.id === bookingId ? response.data.data : b)));
            setSuccessDialogOpen(true); // Hiển thị dialog thành công
            setSuccessMessage('Gửi yêu cầu hủy thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi hủy đặt phòng.');
            console.error(error);
        } finally {
            setCancelModalOpen(false);
        }
    };

    return (
        <div className="container">
            <h2 className="text-center my-4">Danh Sách Phòng Đã Đặt</h2>

            <table className="table table-bordered table-hover order-table">
                <thead className="thead-dark">
                    <tr>
                        <th>Ngày đặt</th>
                        <th>Tên</th>
                        <th>Phòng</th>
                        <th>SĐT</th>
                        <th>Số người</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Tổng tiền</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody id="order_list">
                    {bookings.length > 0 ? (
                        bookings.map((booking) =>
                            booking.rooms?.map((room, roomIndex) => (
                                <tr key={`${booking.id}-${roomIndex}`}>
                                    <td>{formatDate(booking.createAt) || 'N/A'}</td>
                                    <td>{booking.bookingName || 'N/A'}</td>
                                    <td>
                                        {room.roomNumber} - {room.name}
                                    </td>
                                    <td>{booking.bookingPhone || 'N/A'}</td>
                                    <td>{booking.guest}</td>
                                    <td>{parseDate(booking.checkInDate)}</td>
                                    <td>{parseDate(booking.checkOutDate)}</td>
                                    <td>
                                        {booking.totalAmount.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </td>
                                    <td>
                                        <span
                                            className={
                                                booking.bookingStatus === 'Hoàn thành' ||
                                                booking.bookingStatus === 'Chờ xác nhận' ||
                                                booking.bookingStatus === 'Đã xác nhận'
                                                    ? 'text-success'
                                                    : 'text-danger'
                                            }
                                        >
                                            {booking.bookingStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {booking.bookingStatus === 'Hoàn thành' ? (
                                            roomReviewStatus[`${booking.id}-${room.id}`] ? (
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleViewReview(room.id)}
                                                >
                                                    Xem đánh giá
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleOpenReviewModal(room.id, booking.id)}
                                                >
                                                    Đánh giá
                                                </button>
                                            )
                                        ) : booking.bookingStatus === 'Chờ xác nhận' ||
                                          booking.bookingStatus === 'Đã xác nhận' ? (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    setCancelBookingId(booking.id); // Set the booking ID to cancel
                                                    setCancelModalOpen(true); // Open the cancel dialog
                                                }}
                                            >
                                                Hủy
                                            </button>
                                        ) : booking.bookingStatus === 'Đã hủy' ||
                                          booking.bookingStatus === 'Yêu cầu hủy' ? (
                                            <Link to="/rooms" className="btn btn-success">
                                                Đặt Phòng
                                            </Link>
                                        ) : null}
                                    </td>
                                </tr>
                            )),
                        )
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
                <DialogTitle>Đánh giá của bạn</DialogTitle>
                <DialogContent>
                    <div>
                        {/* Star Rating */}
                        {[1, 2, 3, 4, 5].map((value) => (
                            <span
                                key={value}
                                style={{
                                    cursor: 'pointer',
                                    color: rating >= value ? 'gold' : 'gray',
                                }}
                                onClick={() => setRating(value)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Nhập nội dung đánh giá của bạn..."
                    />
                    {reviewError && <p style={{ color: 'red' }}>{reviewError}</p>}
                    {reviewSuccess && <p style={{ color: 'green' }}>{successMessage}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewModalOpen(false)} color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={handleReviewSubmit} color="primary" disabled={!rating || !reviewText}>
                        Gửi Đánh Giá
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)}>
                <DialogTitle>Xác nhận hủy đặt phòng</DialogTitle>
                <DialogContent>
                    <p>Bạn có chắc chắn muốn hủy đặt phòng này?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelModalOpen(false)} color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={() => handleCancelBooking(cancelBookingId)} color="primary">
                        Xác nhận hủy
                    </Button>
                </DialogActions>
            </Dialog>

            <SuccessDialog
                open={successDialogOpen}
                message={successMessage}
                onClose={() => setSuccessDialogOpen(false)}
            />
        </div>
    );
}

export default InformationBooking;
