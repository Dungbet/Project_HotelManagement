import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import vi from 'date-fns/locale/vi';
import { format, parse, isValid } from 'date-fns';
import { Popover, InputNumber, Button } from 'antd';

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
    const [selectedRooms, setSelectedRooms] = useState([]);

    const [totalAmount, setTotalAmount] = useState(0);

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
    const [validationErrors, setValidationErrors] = useState([]);

    // Quản lý số lượng phòng và khách
    const [numRooms, setNumRooms] = useState(null);
    const [numAdults, setNumAdults] = useState(null);
    const [numChildren, setNumChildren] = useState(null);

    const handleReset = () => {
        setNumRooms(1);
        setNumAdults(1);
        setNumChildren(0);
    };

    // Hàm xử lý thay đổi số phòng
    const handleRoomsChange = (action) => {
        if (action === 'increase' && numRooms < 10) {
            setNumRooms(numRooms + 1);
        } else if (action === 'decrease' && numRooms > 1) {
            setNumRooms(numRooms - 1);
        }
    };

    const maxGuestsPerRoom = 8; // Số lượng khách tối đa mỗi phòng

    // Hàm xử lý thay đổi số người lớn
    const handleAdultsChange = (action) => {
        const totalGuests = numAdults + numChildren; // Tổng số khách hiện tại
        if (action === 'increase' && totalGuests < maxGuestsPerRoom) {
            setNumAdults(numAdults + 1);
        } else if (action === 'decrease' && numAdults > 1) {
            setNumAdults(numAdults - 1);
        }
    };

    // Hàm xử lý thay đổi số trẻ em
    const handleChildrenChange = (action) => {
        const totalGuests = numAdults + numChildren; // Tổng số khách hiện tại
        if (action === 'increase' && totalGuests < maxGuestsPerRoom) {
            setNumChildren(numChildren + 1);
        } else if (action === 'decrease' && numChildren > 0) {
            setNumChildren(numChildren - 1);
        }
    };
    const handleRoomSelection = (room) => {
        if (selectedRooms.find((r) => r.id === room.id)) {
            // Nếu phòng đã được chọn, bỏ chọn nó
            const newSelectedRooms = selectedRooms.filter((r) => r.id !== room.id);
            setSelectedRooms(newSelectedRooms);
        } else {
            // Nếu phòng chưa được chọn và chưa đạt giới hạn
            if (selectedRooms.length < numRooms) {
                setSelectedRooms([...selectedRooms, room]);
            } else {
                alert(`Bạn chỉ có thể chọn ${numRooms} phòng!`);
                // Bỏ check checkbox nếu vượt quá số lượng cho phép
                const checkbox = document.getElementById(`room-${room.id}`);
                if (checkbox) checkbox.checked = false;
            }
        }
    };
    // Cập nhật tổng tiền mỗi khi selectedRooms thay đổi
    useEffect(() => {
        const total = selectedRooms.reduce((sum, room) => {
            // Sử dụng giá đã giảm nếu có, ngược lại sử dụng giá gốc
            const roomPrice = room.discount > 0 ? room.discountedPrice : room.price;
            return sum + roomPrice;
        }, 0);
        setTotalAmount(total);
    }, [selectedRooms]);

    // Thêm useEffect để reset selection khi numRooms thay đổi
    useEffect(() => {
        setSelectedRooms([]);
        setTotalAmount(0);
        // Bỏ check tất cả các checkbox
        const checkboxes = document.querySelectorAll('.room-checkbox');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
    }, [numRooms]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const newCheckinDate = parseDate(queryParams.get('checkinDate') || '');
        const newCheckoutDate = parseDate(queryParams.get('checkoutDate') || '');
        const newSortOption = queryParams.get('sortedField') || '';
        const newKeyword = queryParams.get('keyword') || '';
        const newNumAdults = parseInt(queryParams.get('numAdults')) || 1;
        const newNumChildren = parseInt(queryParams.get('numChildren')) || 0;
        const newNumRooms = parseInt(queryParams.get('numRooms')) || 1;

        setNumAdults(newNumAdults);
        setNumChildren(newNumChildren);
        setNumRooms(newNumRooms);

        if (isValid(newCheckinDate) && isValid(newCheckoutDate)) {
            fetchRooms(
                newCheckinDate,
                newCheckoutDate,
                page,
                newSortOption,
                newKeyword,
                newNumAdults,
                newNumChildren,
                newNumRooms,
            );
        }
    }, [location.search, page]); // Khi location.search hoặc page thay đổi, fetch lại dữ liệu
    // Initialize dates
    useEffect(() => {
        setCheckinDate(parseDate(initialCheckinDate));
        setCheckoutDate(parseDate(initialCheckoutDate));
    }, [initialCheckinDate, initialCheckoutDate]);

    const fetchRooms = (checkinDate, checkoutDate, page, sortOption, keyword, numAdults, numChildren) => {
        if (isValid(checkinDate) && isValid(checkoutDate)) {
            setLoading(true); // Start loading
            axios
                .get('http://localhost:8080/room/available-rooms', {
                    params: {
                        checkinDate: formatDate(checkinDate),
                        checkoutDate: formatDate(checkoutDate),
                        page: page,
                        size: size,
                        sortedField: sortOption,
                        keyword: keyword,
                        numAdults: numAdults || 1, // Default to 1 if numAdults is null
                        numChildren: numChildren || 0, // Default to 0 if numChildren is null
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
                )}&sortedField=${sortOption}&keyword=${keyword}&numAdults=${numAdults}&numChildren=${numChildren}&numRooms=${numRooms}`,
            );
            setPage(0); // Reset page to 0 when searching with new dates
        } else {
            console.error('Ngày tháng không hợp lệ');
        }
    };
    // Hàm kiểm tra validation
    const validateBooking = () => {
        const errors = [];

        if (!checkinDate) {
            errors.push('Vui lòng chọn ngày đến');
        }

        if (!checkoutDate) {
            errors.push('Vui lòng chọn ngày đi');
        }

        if (!numRooms || numRooms < 1) {
            errors.push('Vui lòng chọn số phòng');
        }

        if (!numAdults || numAdults < 1) {
            errors.push('Vui lòng chọn số người lớn');
        }

        if (selectedRooms.length !== numRooms) {
            errors.push(`Vui lòng chọn đủ ${numRooms} phòng`);
        }

        return errors;
    };

    // Hàm xử lý đặt phòng
    const handleBooking = () => {
        const errors = validateBooking();

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Clear previous errors if any
        setValidationErrors([]);

        // Calculate total price for all selected rooms
        const totalPrice = selectedRooms.reduce((sum, room) => {
            return sum + (room.discount > 0 ? room.discountedPrice : room.price);
        }, 0);

        // Navigate to booking page with all necessary parameters
        navigate(
            `/booking?` +
                `checkinDate=${formatDate(checkinDate)}&` +
                `checkoutDate=${formatDate(checkoutDate)}&` +
                `guests=${numAdults}&` +
                `price=${totalPrice}&` +
                `numChildren=${numChildren}&` +
                `numRooms=${numRooms}&` +
                `id=${selectedRooms.map((room) => room.id).join(',')}`,
        );
    };
    const GuestSelectionContent = (
        <div style={{ width: 250, padding: 10 }}>
            <div style={{ marginBottom: 10 }}>
                <label>Số phòng:</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                        className="adjuster guest-selector"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <span>{numRooms} Phòng</span>
                        <button onClick={() => handleRoomsChange('decrease')} disabled={numRooms === 1}>
                            -
                        </button>
                        <button onClick={() => handleRoomsChange('increase')} disabled={numRooms === 10}>
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: 10 }}>
                <label>Người lớn:</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                        className="adjuster guest-selector"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <span>{numAdults} Người lớn</span>
                        <button onClick={() => handleAdultsChange('decrease')} disabled={numAdults === 1}>
                            -
                        </button>
                        <button
                            onClick={() => handleAdultsChange('increase')}
                            disabled={numAdults + numChildren >= maxGuestsPerRoom}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: 10 }}>
                <label>Trẻ em:</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                        className="adjuster guest-selector"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <span>{numChildren} Trẻ em Mỗi phòng</span>
                        <button onClick={() => handleChildrenChange('decrease')} disabled={numChildren === 0}>
                            -
                        </button>
                        <button
                            onClick={() => handleChildrenChange('increase')}
                            disabled={numAdults + numChildren >= maxGuestsPerRoom}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <Button type="link" onClick={handleReset} style={{ marginTop: 10, padding: 0 }}>
                Đặt lại các trường
            </Button>
        </div>
    );

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
                                                <label htmlFor="guest">Phòng & Khách:</label>
                                                <Popover content={GuestSelectionContent} trigger="click">
                                                    <div
                                                        className="guest-selector guest-info"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {`${numRooms} phòng: ${numAdults} người lớn, ${numChildren} trẻ em/phòng`}
                                                    </div>
                                                </Popover>
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
                                            {/* Checkbox ở góc trái */}
                                            <div className="position-absolute top-0 left-0 p-3">
                                                <input
                                                    type="checkbox"
                                                    id={`room-${room.id}`}
                                                    className="form-check-input room-checkbox"
                                                    checked={selectedRooms.some((r) => r.id === room.id)}
                                                    onChange={() => handleRoomSelection(room)}
                                                />
                                            </div>
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
                                                            <td>Tối đa {room.capacity} người</td>
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
            <div className="fixed-footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <span className="footer-text">
                            Đã chọn: {selectedRooms.length}/{numRooms} phòng
                        </span>
                        <span className="separator">|</span>
                        <span className="total-price">Tổng: {totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <button className="book-now-button" onClick={handleBooking}>
                        ĐẶT NGAY
                    </button>
                </div>
            </div>
        </>
    );
}

export default RoomAvailable;
