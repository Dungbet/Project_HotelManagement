import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(0); // Current page
    const [totalPages, setTotalPages] = useState(0); // Total pages
    const [sortOption, setSortOption] = useState(''); // Sort option
    const size = 6; // Number of rooms per page

    useEffect(() => {
        // Fetch rooms based on the selected sorting option
        let url = `http://localhost:8080/room/?page=${page}&size=${size}`; // Default endpoint

        if (sortOption === '1') {
            url = `http://localhost:8080/room/sort-by-price?page=${page}&size=${size}`;
        } else if (sortOption === '2') {
            url = `http://localhost:8080/room/sort-by-capacity?page=${page}&size=${size}`;
        } else if (sortOption === '3') {
            url = `http://localhost:8080/room/select-by-sale?page=${page}&size=${size}`;
        }

        axios
            .get(url)
            .then((response) => {
                console.log(response.data);
                setRooms(response.data.data.data);
                setTotalPages(response.data.data.totalPages);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi gọi API', error);
            });
    }, [page, sortOption]);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setPage(0); // Reset to first page when sort option changes
    };

    if (rooms.length === 0) {
        return (
            <div className="col-lg-12">
                <p>Hiện tại không có phòng nào. Mong bạn quay lại sau!</p>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb Section Begin */}
            <div className="breadcrumb-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="breadcrumb-text">
                                <h2>Phòng của chúng tôi</h2>
                                <div className="bt-option">
                                    <Link to="/">Trang Chủ</Link>
                                    <span>Phòng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}

            {/* Rooms Section Begin */}
            <section className="rooms-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="select-container">
                                <select
                                    className="form-select select-right"
                                    aria-label="Default select example"
                                    value={sortOption}
                                    onChange={handleSortChange}
                                >
                                    <option value="">Sắp xếp</option>
                                    <option value="1">Giá (ưu tiên thấp nhất)</option>
                                    <option value="2">Số lượng người (ít - nhiều)</option>
                                    <option value="3">Đang giảm giá</option>
                                </select>
                            </div>
                        </div>

                        {rooms.map((room) => {
                            // Làm tròn discountPrice sau dấu thập phân 1 chữ số
                            const discountedPrice = room.discountedPrice.toFixed(1);
                            const formattedDiscountedPrice = discountedPrice.toLocaleString('vi-VN');

                            const formattedPrice = room.price.toLocaleString('vi-VN');

                            return (
                                <div key={room.id} className="col-lg-4 col-md-6">
                                    <div className="room-item">
                                        {/* Hiển thị tag giảm giá chỉ khi giảm giá không phải 0% */}
                                        {room.discount > 0 && (
                                            <div className="discount-tag">Giảm giá {room.discount}%</div>
                                        )}
                                        <img src={room.roomImg} alt={room.name} />
                                        <div className="ri-text">
                                            <h4>{room.name}</h4>
                                            <h3>
                                                {room.discount > 0 ? (
                                                    <>
                                                        {/* Hiển thị giá bị gạch */}
                                                        <span
                                                            style={{
                                                                textDecoration: 'line-through',
                                                                color: '#888',
                                                                fontSize: '16px',
                                                            }}
                                                        >
                                                            {formattedPrice} VNĐ
                                                        </span>
                                                        <br />
                                                        {/* Hiển thị giá giảm ở dưới */}
                                                        {formattedDiscountedPrice} VNĐ
                                                        <span>/Mỗi đêm</span>
                                                    </>
                                                ) : (
                                                    // Chỉ hiển thị giá gốc nếu không có giảm giá
                                                    `${formattedPrice} VNĐ`
                                                )}
                                            </h3>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td className="r-o">Kích thước:</td>
                                                        <td>{room.size} m²</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="r-o">Dung tích:</td>
                                                        <td>Tối đa {room.capacity} người + 1 trẻ nhỏ</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="r-o">Giường:</td>
                                                        <td>{room.bed} giường</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="r-o">View:</td>
                                                        <td>{room.view}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <Link to={`/room-detail/${room.id}`} className="primary-btn">
                                                Xem thêm
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="col-lg-12">
                        <div className="room-pagination">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className={index === page ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(index);
                                    }}
                                >
                                    {index + 1}
                                </a>
                            ))}
                            {page < totalPages - 1 && (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(page + 1);
                                    }}
                                >
                                    Tiếp <i className="fa fa-long-arrow-right"></i>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* Rooms Section End */}
        </>
    );
}

export default Rooms;
