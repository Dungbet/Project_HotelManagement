import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import vi from 'date-fns/locale/vi';
import { format, parse, isValid } from 'date-fns';

// Helper function to convert date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (date) => {
    return isValid(date) ? format(date, 'dd/MM/yyyy') : '';
};

// Helper function to parse date from DD/MM/YYYY to JavaScript Date object
const parseDate = (dateStr) => {
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : null;
};

function RoomAvailable() {
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(0); // Current page
    const [totalPages, setTotalPages] = useState(0); // Total pages
    const [loading, setLoading] = useState(false); // Loading state
    const size = 6; // Number of rooms per page

    const [checkinDate, setCheckinDate] = useState(null);
    const [checkoutDate, setCheckoutDate] = useState(null);
    const [sortOption, setSortOption] = useState('price'); // Sort option
    const [keyword, setKeyword] = useState(''); // Keyword for sorting

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialCheckinDate = queryParams.get('checkinDate') || '';
    const initialCheckoutDate = queryParams.get('checkoutDate') || '';

    // Initialize dates
    useEffect(() => {
        setCheckinDate(parseDate(initialCheckinDate));
        setCheckoutDate(parseDate(initialCheckoutDate));
    }, [initialCheckinDate, initialCheckoutDate]);

    const fetchRooms = (checkinDate, checkoutDate, page, sortOption, keyword) => {
        if (isValid(checkinDate) && isValid(checkoutDate)) {
            setLoading(true); // Start loading
            axios
                .get('http://localhost:8080/room/available-rooms', {
                    params: {
                        checkinDate: formatDate(checkinDate),
                        checkoutDate: formatDate(checkoutDate),
                        page: page,
                        size: size,
                        sortedField: sortOption, // Add sort option here
                        keyword: keyword,
                    },
                })
                .then((response) => {
                    setRooms(response.data.data.data);
                    setTotalPages(response.data.data.totalPages);
                    setLoading(false); // End loading
                })
                .catch((error) => {
                    console.error('Có lỗi xảy ra khi gọi API', error);
                    setLoading(false); // End loading
                });
        } else {
            console.error('Ngày tháng không hợp lệ');
        }
    };

    const handleCheckinChange = (date) => {
        setCheckinDate(date);
        if (checkoutDate && date >= checkoutDate) {
            setCheckoutDate(null);
        }
    };

    const handleCheckoutChange = (date) => {
        if (checkinDate && date <= checkinDate) {
            console.error('Ngày đi phải sau ngày đến');
            return;
        }
        setCheckoutDate(date);
    };

    const handleSortChange = (e) => {
        const selectedSortOption = e.target.value;
        setSortOption(selectedSortOption);
        setPage(0); // Reset page to 0 when sorting changes
        if (selectedSortOption === 'discount') {
            setKeyword('des');
        } else {
            setKeyword('');
        }
    };

    const handleSearch = () => {
        if (isValid(checkinDate) && isValid(checkoutDate)) {
            // Update the URL with selected dates and sort option
            navigate(
                `?checkinDate=${formatDate(checkinDate)}&checkoutDate=${formatDate(
                    checkoutDate,
                )}&sortedField=${sortOption}&keyword=${keyword}`,
            );
            setPage(0); // Reset page to 0 when searching with new dates
        } else {
            console.error('Ngày tháng không hợp lệ');
        }
    };

    useEffect(() => {
        // Fetch rooms when URL search parameters change
        const queryParams = new URLSearchParams(location.search);
        const newCheckinDate = parseDate(queryParams.get('checkinDate') || '');
        const newCheckoutDate = parseDate(queryParams.get('checkoutDate') || '');
        const newSortOption = queryParams.get('sortedField') || '';
        const newKeyword = queryParams.get('keyword') || ''; // Add keyword here

        if (isValid(newCheckinDate) && isValid(newCheckoutDate)) {
            fetchRooms(newCheckinDate, newCheckoutDate, page, newSortOption, newKeyword);
        }
    }, [location.search, page]); // Depend on location.search and page

    // Show preloader only when loading
    if (loading) {
        return (
            <div id="preloder">
                <div className="loader"></div>
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
                                <h2>Phòng trống</h2>
                                <div className="bt-option">
                                    <Link to="/">Trang Chủ</Link>
                                    <span>Phòng</span>
                                </div>
                                <div className="date-selection booking-form">
                                    <form>
                                        <div className="booking-form-container">
                                            <div className="booking-form-item">
                                                <label>Ngày đến:</label>
                                                <DatePicker
                                                    selected={checkinDate}
                                                    onChange={handleCheckinChange}
                                                    minDate={new Date()}
                                                    dateFormat="dd/MM/yyyy"
                                                    className="date-input"
                                                    placeholderText="Chọn ngày đến"
                                                    locale={vi}
                                                />
                                            </div>
                                            <div className="booking-form-item">
                                                <label>Ngày đi:</label>
                                                <DatePicker
                                                    selected={checkoutDate}
                                                    onChange={handleCheckoutChange}
                                                    minDate={
                                                        checkinDate
                                                            ? new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000)
                                                            : new Date()
                                                    }
                                                    dateFormat="dd/MM/yyyy"
                                                    className="date-input"
                                                    placeholderText="Chọn ngày đi"
                                                    locale={vi}
                                                />
                                            </div>
                                            <div className="booking-form-item">
                                                <label>Sắp xếp:</label>
                                                <select
                                                    className="form-select select-right"
                                                    aria-label="Default select example"
                                                    value={sortOption}
                                                    onChange={handleSortChange}
                                                >
                                                    <option value="price">Giá (ưu tiên thấp nhất)</option>
                                                    <option value="capacity">Số lượng người (ít - nhiều)</option>
                                                    <option value="discount">Giảm giá (ưu tiên giảm nhiều)</option>
                                                </select>
                                            </div>
                                            <div className="booking-form-item">
                                                <button
                                                    type="button"
                                                    className="booking-form-button"
                                                    onClick={handleSearch}
                                                >
                                                    Tìm kiếm
                                                </button>
                                            </div>
                                        </div>
                                    </form>
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
                        {rooms.length > 0 ? (
                            rooms.map((room) => {
                                const discountedPrice = room.discountedPrice.toFixed(1);
                                const formattedPrice = room.price.toLocaleString('vi-VN');
                                const formattedDiscountedPrice = discountedPrice.toLocaleString('vi-VN');
                                return (
                                    <div key={room.id} className="col-lg-4 col-md-6">
                                        <div className="room-item">
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
                                                                {formattedDiscountedPrice} VNĐ
                                                            </span>
                                                            <br />
                                                            {/* Hiển thị giá giảm ở dưới */}
                                                            {discountedPrice} VNĐ
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
                                                <Link
                                                    to={`/room-detail/${room.id}?checkinDate=${formatDate(
                                                        checkinDate,
                                                    )}&checkoutDate=${formatDate(checkoutDate)}`}
                                                    className="primary-btn"
                                                >
                                                    Xem Chi Tiết
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-lg-12">
                                <p>Không có phòng trống trong khoảng thời gian đã chọn.</p>
                            </div>
                        )}
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
                        </div>
                    </div>
                </div>
            </section>
            {/* Rooms Section End */}
        </>
    );
}

export default RoomAvailable;
