import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BookingDetailsModal from './DetailBoooking.js';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Số lượng phòng mỗi trang
    const [endPage, setEndPage] = useState(1); // Tổng số trang
    const [filter, setFilter] = useState('booked'); // Lọc: 'booked' hoặc 'empty'
    const [role, setRole] = useState(null);
    const [selectedBookingId, setSelectedBookingId] = useState(null); // ID đặt phòng được chọn
    const [isRoomDetailsModalVisible, setIsRoomDetailsModalVisible] = useState(false);

    const navigate = useNavigate(); // Khởi tạo useNavigate
    const getToken = () => localStorage.getItem('token');
    // Giải mã token để lấy role
    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);

                setRole(decoded.sub); // Lấy giá trị 'sub' từ payload
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };

    useEffect(() => {
        fetchRooms();
        decodeToken();
    }, [page, filter]);

    // Hàm để tính toán ngày hiện tại và ngày đi
    const getDates = () => {
        const today = new Date();
        const checkInDate = today.toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)
        today.setDate(today.getDate() + 1); // Thêm 1 ngày cho ngày đi
        const checkOutDate = today.toISOString().split('T')[0]; // Lấy ngày đi (YYYY-MM-DD)
        return { checkInDate, checkOutDate };
    };

    const fetchRooms = async () => {
        const endpoint =
            filter === 'booked'
                ? 'http://localhost:8080/admin/room/booked-rooms'
                : 'http://localhost:8080/admin/room/empty-rooms';
        try {
            const token = getToken();
            const response = await axios.get(endpoint, {
                params: { page, size },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { data, totalPages } = response.data.data;
            setRooms(data);
            setEndPage(totalPages);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };
    // Hàm để điều hướng khi nhấn nút "Đặt ngay"
    const handleBookNow = (roomId) => {
        if (role === 'admin') {
            const { checkInDate, checkOutDate } = getDates();
            // Chuyển đến trang thêm đặt phòng và gửi thông tin phòng cùng ngày
            navigate(`/admin/add-booking?roomId=${roomId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);
        } else if (role === 'manager') {
            const { checkInDate, checkOutDate } = getDates();
            navigate(`/manager/add-booking?roomId=${roomId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);
        } else {
            navigate('/login');
        }
    };
    // Hiển thị modal chi tiết phòng
    const handleViewDetails = (bookingId) => {
        setSelectedBookingId(bookingId);
        setIsRoomDetailsModalVisible(true);
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Danh sách phòng</h6>
                    <div className="dropdown">
                        <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => {
                                setPage(0); // Reset lại trang khi thay đổi bộ lọc
                                setFilter(e.target.value);
                            }}
                        >
                            <option value="booked">Đã đặt</option>
                            <option value="empty">Phòng trống</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table text-start align-middle table-hover table-striped mb-0">
                        <thead>
                            <tr className="text-dark">
                                <th scope="col">ID</th>
                                <th scope="col">Ảnh</th>
                                <th scope="col">Tên Phòng</th>
                                <th scope="col">Số Phòng</th>
                                <th scope="col">Giá</th>
                                <th scope="col">Hạng Phòng</th>
                                <th scope="col">Tối đa (người)</th>
                                <th scope="col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id}>
                                    <td>{room.id}</td>
                                    <td>
                                        {room.roomImg ? (
                                            <img
                                                src={room.roomImg}
                                                alt="Room"
                                                style={{ width: '50px', height: '50px' }}
                                            />
                                        ) : (
                                            'Không có ảnh'
                                        )}
                                    </td>
                                    <td>{room.name}</td>
                                    <td>{room.roomNumber}</td>
                                    <td>
                                        {room.discountedPrice
                                            ? `${room.discountedPrice.toLocaleString()} VNĐ`
                                            : `${room.price.toLocaleString()} VNĐ`}
                                    </td>
                                    <td>{room.category ? room.category.name : 'Không xác định'}</td>
                                    <td>{room.capacity}</td>
                                    <td>
                                        {filter === 'empty' ? (
                                            <button onClick={() => handleBookNow(room.id)} className="btn btn-primary">
                                                Đặt ngay
                                            </button>
                                        ) : room.bookings && room.bookings.length > 0 ? (
                                            room.bookings.map((booking) => (
                                                <i
                                                    key={booking.id}
                                                    className="fa-solid fa-eye"
                                                    style={{ cursor: 'pointer', marginRight: '10px' }}
                                                    onClick={() => handleViewDetails(booking.id)}
                                                ></i>
                                            ))
                                        ) : (
                                            <span>Không có đặt phòng</span> // Fallback nếu không có booking
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-center">
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(Math.max(0, page - 1))}
                                        aria-label="Previous"
                                        disabled={page === 0}
                                    >
                                        <span aria-hidden="true">&laquo;</span>
                                    </button>
                                </li>
                                {Array.from({ length: endPage }, (_, i) => i).map((i) => (
                                    <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(i)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(Math.min(endPage - 1, page + 1))}
                                        aria-label="Next"
                                        disabled={page === endPage - 1}
                                    >
                                        <span aria-hidden="true">&raquo;</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            {/* Modal */}
            {isRoomDetailsModalVisible && (
                <BookingDetailsModal
                    isVisible={isRoomDetailsModalVisible}
                    bookingId={selectedBookingId}
                    onClose={() => setIsRoomDetailsModalVisible(false)}
                />
            )}
        </div>
    );
};

export default RoomList;
