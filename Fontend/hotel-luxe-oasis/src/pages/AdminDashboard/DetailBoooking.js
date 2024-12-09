import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'antd';

const BookingDetailsModal = ({ isVisible, bookingId, onClose }) => {
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        if (isVisible) fetchBookingDetails();
    }, [isVisible]);

    // Function to fetch booking details
    // Hàm lấy chi tiết booking từ API
    const fetchBookingDetails = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/booking/search?id=${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBookingDetails(response.data.data); // Lưu dữ liệu booking vào state
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to render booking details
    const renderBookingDetails = () => {
        if (!bookingDetails) return null;

        return (
            <div className="p-4">
                {/* Booking Information */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Thông Tin Đặt Phòng</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <strong>Ngày Nhận Phòng:</strong>
                            <p>{bookingDetails.checkInDate}</p>
                        </div>
                        <div>
                            <strong>Ngày Trả Phòng:</strong>
                            <p>{bookingDetails.checkOutDate}</p>
                        </div>
                        <div>
                            <strong>Số Khách:</strong>
                            <p>
                                {bookingDetails.guest} (Trẻ em: {bookingDetails.numChildren})
                            </p>
                        </div>
                        <div>
                            <strong>Tổng Tiền:</strong>
                            <p>{bookingDetails.totalAmount.toLocaleString()} VND</p>
                        </div>
                        <div>
                            <strong>Trạng Thái:</strong>
                            <p>{bookingDetails.status}</p>
                        </div>
                        <div>
                            <strong>Trạng Thái Đặt Phòng:</strong>
                            <p>{bookingDetails.bookingStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Guest Information */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Thông Tin Khách Hàng</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <strong>Tên:</strong>
                            <p>{bookingDetails.bookingName}</p>
                        </div>
                        <div>
                            <strong>Email:</strong>
                            <p>{bookingDetails.bookingEmail}</p>
                        </div>
                        <div>
                            <strong>Số Điện Thoại:</strong>
                            <p>{bookingDetails.bookingPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Rooms Information */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Thông Tin Phòng</h2>
                    {bookingDetails.rooms.map((room) => (
                        <div key={room.id} className="border p-3 mb-2 rounded">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <strong>Tên Phòng:</strong>
                                    <p>{room.name}</p>
                                </div>
                                <div>
                                    <strong>Số Phòng:</strong>
                                    <p>{room.roomNumber}</p>
                                </div>
                                <div>
                                    <strong>Giá Gốc:</strong>
                                    <p>{room.price.toLocaleString()} VND</p>
                                </div>
                                <div>
                                    <strong>Giá Giảm:</strong>
                                    <p>{room.discountedPrice.toLocaleString()} VND</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Modal visible={isVisible} onCancel={onClose} footer={null} title={null}>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    bookingDetails && (
                        <div>
                            {/* Render thông tin chi tiết */}
                            {renderBookingDetails(bookingDetails)}
                        </div>
                    )
                )}
            </Modal>
        </>
    );
};

export default BookingDetailsModal;
