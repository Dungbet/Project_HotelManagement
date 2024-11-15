import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, parse } from 'date-fns';

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

    const navigate = useNavigate();

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

        const fetchUserReviews = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            try {
                const response = await axios.get(`http://localhost:8080/review/user-reviews?id=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const reviews = response.data.data;
                const reviewsMap = {};
                reviews.forEach((review) => {
                    reviewsMap[review.room.id] = review;
                });
                setUserReviews(reviewsMap);
            } catch (err) {
                console.error('Không thể lấy đánh giá:', err);
            }
        };

        fetchBookings();
        fetchUserReviews();
    }, [navigate]);

    const handleReviewSubmit = async (rating, reviewText, bookingId) => {
        const token = localStorage.getItem('token');

        if (!token || !selectedRoomId || !rating || !reviewText) {
            setReviewError('Vui lòng chọn sao, nhập nội dung đánh giá và đảm bảo bạn đã đăng nhập.');
            return;
        }

        const reviewData = {
            rating: rating,
            comment: reviewText,
            booking: { id: bookingId },
            room: { id: selectedRoomId },
        };

        try {
            await axios.post('http://localhost:8080/review/create', reviewData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBookings((prevBookings) =>
                prevBookings.map((booking) => {
                    if (booking.id === bookingId) {
                        return {
                            ...booking,
                            isRated: true,
                            rated: true,
                        };
                    }
                    return booking;
                }),
            );

            setUserReviews((prev) => ({ ...prev, [selectedRoomId]: reviewData }));
            setReviewSuccess(true);
            setReviewError('');
            setReviewModalOpen(false);
            setSuccessMessage('Đánh giá thành công');
        } catch (error) {
            console.error('Error submitting review:', error);
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
        setReviewModalOpen(true);
        setReviewSuccess(false);
        setReviewError('');
        setCurrentBookingId(bookingId);
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

            // Update bookings with the response data
            setBookings((prevBookings) => prevBookings.map((b) => (b.id === bookingId ? response.data.data : b)));

            // Set success message here
            setSuccessMessage('Gửi yêu cầu hủy thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi hủy đặt phòng.');
            console.error(error);
        } finally {
            setConfirmCancel(false); // Close the confirmation modal
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
                        bookings.map((booking, index) => (
                            <tr key={index}>
                                <td>{formatDate(booking.createAt) || 'N/A'}</td>
                                <td>{booking.bookingName || 'N/A'}</td>
                                <td>{booking.room ? booking.room.roomNumber : 'N/A'}</td>
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
                                            booking.bookingStatus === 'Hoàn thành' || booking.bookingStatus === 'Đã đặt'
                                                ? 'text-success'
                                                : 'text-danger'
                                        }
                                    >
                                        {booking.bookingStatus}
                                    </span>
                                </td>
                                <td>
                                    {booking.bookingStatus === 'Hoàn thành' && !booking.rated ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleOpenReviewModal(booking.room.id, booking.id)}
                                        >
                                            Đánh giá
                                        </button>
                                    ) : booking.bookingStatus === 'Hoàn thành' && booking.rated ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleViewReview(booking.room.id)}
                                        >
                                            Xem đánh giá
                                        </button>
                                    ) : booking.bookingStatus === 'Đã đặt' ? (
                                        <button className="btn btn-danger" onClick={() => setConfirmCancel(booking.id)}>
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

            {reviewModalOpen && (
                <div className="custom-modal" id="review-modal">
                    <div className="custom-review-box">
                        <h2>Đánh giá của bạn</h2>
                        <div className="custom-star-rating" id="star-rating">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <span
                                    key={value}
                                    className={`custom-star ${
                                        userReviews[selectedRoomId]?.rating >= value ? 'selected' : ''
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setUserReviews((prev) => ({
                                            ...prev,
                                            [selectedRoomId]: {
                                                ...prev[selectedRoomId],
                                                rating: value,
                                            },
                                        }));
                                    }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            className="custom-textarea"
                            id="review-text"
                            placeholder="Nhập nội dung đánh giá của bạn..."
                            rows="4"
                        ></textarea>
                        <button
                            className="button-review"
                            onClick={() => {
                                const reviewText = document.getElementById('review-text').value;
                                handleReviewSubmit(userReviews[selectedRoomId]?.rating, reviewText, currentBookingId);
                            }}
                            disabled={
                                !userReviews[selectedRoomId]?.rating || !document.getElementById('review-text').value
                            }
                        >
                            Gửi Đánh Giá
                        </button>
                        {successMessage && (
                            <div className="custom-modal" id="success-modal">
                                <div className="custom-review-box">
                                    <h2>{successMessage}</h2>
                                    <button
                                        className="button-review"
                                        onClick={() => setSuccessMessage('')}
                                        style={{ backgroundColor: '#dc3545' }}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {confirmCancel && (
                <div className="custom-modal" id="cancel-modal">
                    <div className="custom-review-box">
                        <h2>Bạn có chắc chắn muốn hủy không?</h2>
                        <button className="btn btn-danger" onClick={() => handleCancelBooking(confirmCancel)}>
                            Có
                        </button>
                        <button className="btn btn-secondary" onClick={() => setConfirmCancel(false)}>
                            Không
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InformationBooking;
