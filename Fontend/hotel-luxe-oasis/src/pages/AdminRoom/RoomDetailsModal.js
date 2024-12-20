import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from 'antd';

const RoomDetailsModal = ({ isVisible, roomId, onClose }) => {
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        if (isVisible && roomId) fetchRoomDetails();
    }, [isVisible, roomId]);

    // Function to fetch room details
    const fetchRoomDetails = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/admin/room/search?id=${roomId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRoomDetails(response.data.data); // Save room details to state
        } catch (error) {
            console.error('Error fetching room details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to render room details
    const renderRoomDetails = () => {
        if (!roomDetails) return null;

        const {
            name,
            roomNumber,
            roomImg,
            price,
            description,
            bed,
            size,
            capacity,
            view,
            hotels,
            discount,
            discountedPrice,
            roomImages,
            category,
        } = roomDetails;

        return (
            <div className="p-4">
                {/* Room Information */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Thông Tin Phòng</h2>
                    <img src={roomImg} alt="Room" className="w-full h-auto rounded mb-4" />
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <strong>Tên Phòng:</strong>
                            <p>{name}</p>
                        </div>
                        <div>
                            <strong>Số Phòng:</strong>
                            <p>{roomNumber}</p>
                        </div>
                        <div>
                            <strong>Giá Gốc:</strong>
                            <p>{price.toLocaleString()} VND</p>
                        </div>
                        <div>
                            <strong>Giá Giảm:</strong>
                            <p>{discountedPrice.toLocaleString()} VND</p>
                        </div>
                        <div>
                            <strong>Giảm Giá:</strong>
                            <p>{discount}%</p>
                        </div>
                        <div>
                            <strong>Kích Thước:</strong>
                            <p>{size} m²</p>
                        </div>
                        <div>
                            <strong>Sức Chứa:</strong>
                            <p>{capacity} người</p>
                        </div>
                        <div>
                            <strong>View:</strong>
                            <p>{view}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <strong>Mô Tả:</strong>
                        <p>{description}</p>
                    </div>
                </div>

                {/* Room Images */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Hình Ảnh Phòng</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {roomImages.map((image) => (
                            <img key={image.id} src={image.imageUrl} alt="Room" className="w-full h-auto rounded" />
                        ))}
                    </div>
                </div>

                {/* Category Information */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Thông Tin Loại Phòng</h2>
                    <div>
                        <strong>Tên Loại:</strong>
                        <p>{category.name}</p>
                    </div>
                    <div>
                        <strong>Mô Tả:</strong>
                        <p>{category.description}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal visible={isVisible} onCancel={onClose} footer={null} title="Chi Tiết Phòng">
            {loading ? <p>Đang tải...</p> : renderRoomDetails()}
        </Modal>
    );
};

export default RoomDetailsModal;
