import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'antd';

const PaymentDetailsModal = ({ isVisible, paymentId, onClose }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        if (isVisible) fetchPaymentDetails();
    }, [isVisible]);

    // Function to fetch payment details
    const fetchPaymentDetails = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/admin/payment/search?id=${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPaymentDetails(response.data.data); // Lưu dữ liệu payment vào state
        } catch (error) {
            console.error('Error fetching payment details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to render payment details
    const renderPaymentDetails = () => {
        if (!paymentDetails) return null;

        return (
            <div className="p-4">
                {/* Payment Information */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Thông Tin Thanh Toán</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <strong>Ngày Thanh Toán:</strong>
                            <p>{new Date(paymentDetails.paymentDate).toLocaleString()}</p>
                        </div>
                        <div>
                            <strong>Số Tiền:</strong>
                            <p>{paymentDetails.amount.toLocaleString()} VND</p>
                        </div>
                        <div>
                            <strong>Phương Thức Thanh Toán:</strong>
                            <p>{paymentDetails.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                {/* Booking Information */}
                {paymentDetails.booking && (
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Thông Tin Đặt Phòng</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <strong>Ngày Nhận Phòng:</strong>
                                <p>{paymentDetails.booking.checkInDate}</p>
                            </div>
                            <div>
                                <strong>Ngày Trả Phòng:</strong>
                                <p>{paymentDetails.booking.checkOutDate}</p>
                            </div>
                            <div>
                                <strong>Số Khách:</strong>
                                <p>
                                    {paymentDetails.booking.guest} (Trẻ em: {paymentDetails.booking.numChildren})
                                </p>
                            </div>
                            <div>
                                <strong>Tổng Tiền:</strong>
                                <p>{paymentDetails.booking.totalAmount.toLocaleString()} VND</p>
                            </div>
                            <div>
                                <strong>Trạng Thái:</strong>
                                <p>{paymentDetails.booking.status}</p>
                            </div>
                            <div>
                                <strong>Trạng Thái Đặt Phòng:</strong>
                                <p>{paymentDetails.booking.bookingStatus}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rooms Information */}
                {paymentDetails.booking && paymentDetails.booking.rooms && (
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Thông Tin Phòng</h2>
                        {paymentDetails.booking.rooms.map((room) => (
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
                )}
            </div>
        );
    };

    return (
        <>
            <Modal visible={isVisible} onCancel={onClose} footer={null} title={null}>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    paymentDetails && (
                        <div>
                            {/* Render thông tin chi tiết */}
                            {renderPaymentDetails(paymentDetails)}
                        </div>
                    )
                )}
            </Modal>
        </>
    );
};

export default PaymentDetailsModal;
