import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import vi from 'date-fns/locale/vi';

function RoomDetail() {
    const { id } = useParams();
    const location = useLocation();
    const [room, setRoom] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guestCount, setGuestCount] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`http://localhost:8080/room/search?id=${id}`)
            .then((response) => {
                setRoom(response.data.data);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi gọi API', error);
            });
    }, [id]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const checkinDateStr = queryParams.get('checkinDate');
        const checkoutDateStr = queryParams.get('checkoutDate');

        if (checkinDateStr) {
            setStartDate(parseDate(checkinDateStr));
        }
        if (checkoutDateStr) {
            setEndDate(parseDate(checkoutDateStr));
        }
    }, [location.search]);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (endDate && date >= endDate) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date) => {
        if (startDate && date <= startDate) {
            setError('Ngày đi phải sau ngày đến.');
            return;
        }
        setEndDate(date);
        setError(''); // Xóa lỗi khi ngày kết thúc được chọn hợp lệ
    };

    const handleGuestCountChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setGuestCount(isNaN(value) ? 0 : value); // Xử lý giá trị NaN
    };

    const checkRoomAvailability = async (roomId, checkinDate, checkoutDate) => {
        try {
            const response = await axios.get('http://localhost:8080/room/check-availability', {
                params: {
                    roomId,
                    checkinDate: formatDate(checkinDate),
                    checkoutDate: formatDate(checkoutDate),
                },
            });
            return response.data.data; // Đảm bảo truy cập đúng thuộc tính
        } catch (error) {
            console.error('Có lỗi xảy ra khi kiểm tra phòng trống', error);
            return false;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!startDate || !endDate) {
            setError('Vui lòng chọn ngày đến và ngày đi.');
            return;
        }

        if (endDate <= startDate) {
            setError('Ngày đi phải sau ngày đến.');
            return;
        }

        if (guestCount <= 0) {
            setError('Số người phải lớn hơn 0.');
            return;
        }

        if (guestCount > room.capacity) {
            setError(
                `Phòng không vượt quá ${room.capacity} người. Vui lòng chọn phòng lớn hơn hoặc đặt thêm phòng! Xin cảm ơn!`,
            );
            return;
        }

        const isAvailable = await checkRoomAvailability(id, startDate, endDate);
        if (!isAvailable) {
            setError('Không còn phòng trống đối với ngày này.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Chuyển hướng đến trang đăng nhập
            return;
        }

        setError('');
        // Tính giá đã giảm
        const discountedPrice = room.discountedPrice ? room.discountedPrice.toFixed(1) : room.price.toFixed(1);

        // Redirect to the booking page with query parameters
        navigate(
            `/booking?checkinDate=${formatDate(startDate)}&checkoutDate=${formatDate(
                endDate,
            )}&guests=${guestCount}&price=${formattedDiscountedPrice}&id=${id}`,
        );
    };

    const formatDate = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const parseDate = (dateString) => {
        return new Date(dateString.split('/').reverse().join('-'));
    };

    if (!room) {
        return (
            <div id="preloder">
                <div className="loader"></div>
            </div>
        );
    }
    const discountedPrice = room.discountedPrice.toFixed(1);
    const formattedPrice = room.price.toLocaleString('vi-VN');
    const formattedDiscountedPrice = discountedPrice.toLocaleString('vi-VN');

    return (
        <div>
            {/* Breadcrumb Section Begin */}
            <div className="breadcrumb-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="breadcrumb-text">
                                <h2>Chi tiết phòng</h2>
                                <div className="bt-option">
                                    <Link to="/">Trang Chủ</Link>
                                    <span>Chi tiết phòng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}

            {/* Room Details Section Begin */}
            <section className="room-details-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="room-details-item">
                                <img src={room.roomImg} alt="" />
                                {room.discount > 0 && <div className="discount-tag">Giảm giá {room.discount}%</div>}
                                <div className="rd-text">
                                    <div className="rd-title">
                                        <h3>{room.name}</h3>
                                        <div className="rdt-right">
                                            <div className="rating">
                                                <i className="icon_star"></i>
                                                <i className="icon_star"></i>
                                                <i className="icon_star"></i>
                                                <i className="icon_star"></i>
                                                <i className="icon_star-half_alt"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <h2>
                                        {room.discount > 0 ? (
                                            <>
                                                {/* Hiển thị giá bị gạch */}
                                                <span
                                                    style={{
                                                        textDecoration: 'line-through',
                                                        color: '#888',
                                                        fontSize: '20px',
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
                                    </h2>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td className="r-o">Kích thước:</td>
                                                <td>{room.size} m²</td>
                                            </tr>
                                            <tr>
                                                <td className="r-o">Dung tích:</td>
                                                <td>Tối đa {room.capacity} người</td>
                                            </tr>
                                            <tr>
                                                <td className="r-o">Giường:</td>
                                                <td>{room.bed} giường</td>
                                            </tr>
                                            <tr>
                                                <td className="r-o">View:</td>
                                                <td> {room.view}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p className="f-para">{room.description}</p>
                                </div>
                            </div>
                            <div className="rd-reviews">
                                <h4>Đánh giá</h4>
                                <div className="review-item">
                                    <div className="ri-pic">
                                        <img src="img/room/avatar/avatar-1.jpg" alt="" />
                                    </div>
                                    <div className="ri-text">
                                        <span>27 Aug 2019</span>
                                        <div className="rating">
                                            <i className="icon_star"></i>
                                            <i className="icon_star"></i>
                                            <i className="icon_star"></i>
                                            <i className="icon_star"></i>
                                            <i className="icon_star-half_alt"></i>
                                        </div>
                                        <h5>Tạ Quang Dũng</h5>
                                        <p>Phòng đẹp, sạch sẽ, view triệu đô.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="room-booking">
                                <h3>Đặt phòng</h3>
                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                <form onSubmit={handleSubmit}>
                                    <div className="check-date">
                                        <label htmlFor="startDate">Ngày đến:</label>
                                        <DatePicker
                                            id="startDate"
                                            selected={startDate}
                                            onChange={handleStartDateChange}
                                            dateFormat="dd/MM/yyyy"
                                            minDate={new Date()}
                                            locale={vi}
                                            placeholderText="Chọn ngày đến"
                                            className="date-picker"
                                        />
                                        <i className="icon_calendar"></i>
                                    </div>
                                    <div className="check-date">
                                        <label htmlFor="endDate">Ngày đi:</label>
                                        <DatePicker
                                            id="endDate"
                                            selected={endDate}
                                            onChange={handleEndDateChange}
                                            dateFormat="dd/MM/yyyy"
                                            minDate={
                                                startDate
                                                    ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
                                                    : new Date()
                                            }
                                            locale={vi}
                                            placeholderText="Chọn ngày đi"
                                            className="date-picker"
                                        />
                                        <i className="icon_calendar"></i>
                                    </div>
                                    <div className="select-option">
                                        <label htmlFor="guestCount">
                                            Số người lớn (tối đa {room.capacity} người) + 1 trẻ nhỏ:
                                        </label>
                                        <input
                                            type="number"
                                            id="guestCount"
                                            value={guestCount || ''}
                                            onChange={handleGuestCountChange}
                                            className="guest-count-input"
                                            placeholder="Số lượng người"
                                        />
                                    </div>
                                    <button type="submit" className="button-check-room">
                                        Đặt Ngay
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Room Details Section End */}
        </div>
    );
}

export default RoomDetail;