import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse, differenceInDays } from 'date-fns';
import vi from 'date-fns/locale/vi';
import { jwtDecode } from 'jwt-decode';

function AddBooking() {
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        roomId: '',
        startDate: null,
        endDate: null,
        name: '',
        phoneNumber: '',
        email: '',
        totalAmount: 0,
        couponCode: '',
        discountedPrice: 0,
        guestCount: '',
        status: 'Chưa thanh toán',
        numChildren: 0,
    });
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [errors, setErrors] = useState({});
    const [cusess, setCuscess] = useState({});
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('token');
    // Giải mã token để lấy role
    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);

                setRole(decoded.role); // Lấy giá trị 'sub' từ payload
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = getToken();
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFormData((prevData) => ({
                    ...prevData,
                    name: response.data.name || '',
                    phoneNumber: response.data.phoneNumber || '',
                    email: response.data.email || '',
                }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
        decodeToken();
    }, [navigate]);

    const fetchAvailableRooms = async (startDate, endDate) => {
        try {
            const token = getToken();
            const formattedStartDate = format(startDate, 'dd/MM/yyyy');
            const formattedEndDate = format(endDate, 'dd/MM/yyyy');
            const roomsResponse = await axios.get(
                `http://localhost:8080/admin/room/available-rooms?checkinDate=${formattedStartDate}&checkoutDate=${formattedEndDate}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );

            const roomsData = Array.isArray(roomsResponse.data.data) ? roomsResponse.data.data : [];
            setRooms(roomsData);
        } catch (error) {
            console.error('Error fetching available rooms', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleStartDateChange = (date) => {
        setFormData((prevState) => ({
            ...prevState,
            startDate: date,
            endDate: date >= prevState.endDate ? null : prevState.endDate,
            roomId: '',
        }));

        if (date && formData.endDate) {
            fetchAvailableRooms(date, formData.endDate);
        }
    };

    const handleEndDateChange = (date) => {
        setFormData((prevState) => ({
            ...prevState,
            endDate: date,
            roomId: '',
        }));

        if (formData.startDate && date) {
            fetchAvailableRooms(formData.startDate, date);
        }
    };

    const handleRoomChange = (e) => {
        const roomId = e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            roomId: roomId,
        }));

        const room = rooms.find((r) => r.id === parseInt(roomId));
        if (room) {
            setSelectedRoom(room);
            setFormData((prevState) => ({
                ...prevState,
                totalAmount: room.price,
                discountedPrice: room.price, // Store as number
                guestCount: '',
            }));
        }
    };
    const handleApplyCoupon = async () => {
        // Xóa thông báo cũ trước khi cập nhật thông báo mới
        setCuscess({});
        setErrors({});
        if (!formData.couponCode.trim()) {
            setDiscount(0);
            setFormData((prevData) => ({
                ...prevData,
                discountedPrice: prevData.totalAmount, // Giữ nguyên giá ban đầu
            }));
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/coupon/code?code=${formData.couponCode}`);
            if (response.data.status === 200) {
                const coupon = response.data.data;
                const originalPrice = parseFloat(formData.totalAmount);
                const discountAmount = (coupon.discountPercentage / 100) * originalPrice;
                let discountedPrice = originalPrice - discountAmount;

                // Giảm thêm 10% cho mỗi trẻ em
                if (formData.numChildren > 0) {
                    const childrenDiscount = (10 / 100) * discountedPrice * formData.childrenCount;
                    discountedPrice -= childrenDiscount;
                }

                setDiscount(discountAmount);
                setFormData((prevData) => ({
                    ...prevData,
                    discountedPrice: discountedPrice,
                }));
                setCuscess({ couponCode: 'Áp dụng mã thành công!' });
            } else {
                // Mã giảm giá sai, giữ nguyên giá hiện tại
                setErrors({ couponCode: 'Mã giảm giá sai hoặc đã hết hạn!' });
                setDiscount(0);

                // Tính lại giá sau giảm giá với số trẻ em nếu có
                const originalPrice = parseFloat(formData.totalAmount);
                let discountedPrice = originalPrice;

                if (formData.numChildren > 0) {
                    const childrenDiscount = (10 / 100) * discountedPrice * formData.numChildren;
                    discountedPrice -= childrenDiscount;
                }

                setFormData((prevData) => ({
                    ...prevData,
                    discountedPrice: discountedPrice, // Giữ lại giá sau giảm giá (nếu có trẻ em)
                }));
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            setErrors({ couponCode: 'Mã giảm giá sai hoặc đã hết hạn!' });
            setDiscount(0);

            // Tính lại giá sau giảm giá với số trẻ em nếu có
            const originalPrice = parseFloat(formData.totalAmount);
            let discountedPrice = originalPrice;

            if (formData.numChildren > 0) {
                const childrenDiscount = (10 / 100) * discountedPrice * formData.numChildren;
                discountedPrice -= childrenDiscount;
            }

            setFormData((prevData) => ({
                ...prevData,
                discountedPrice: discountedPrice, // Giữ lại giá sau giảm giá (nếu có trẻ em)
            }));
        }
    };

    const handleChildrenCountChange = (e) => {
        const numChildren = e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            numChildren: numChildren,
        }));

        if (selectedRoom) {
            const originalPrice = parseFloat(formData.totalAmount);
            let discountedPrice = originalPrice - discount; // Giảm giá từ mã giảm giá đã áp dụng

            // Giảm thêm 10% cho mỗi trẻ em
            if (numChildren > 0) {
                const childrenDiscount = (10 / 100) * discountedPrice * numChildren;
                discountedPrice -= childrenDiscount;
            }

            setFormData((prevData) => ({
                ...prevData,
                discountedPrice: discountedPrice,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form Data:', formData); // Log the form data to ensure it's correct
        // Cập nhật số khách = số người lớn + số trẻ em
        const totalGuests = parseInt(formData.guestCount, 10) + parseInt(formData.numChildren, 10);
        // Validate form data
        const validationErrors = {};
        if (!formData.guestCount) validationErrors.guestCount = 'Số khách là bắt buộc';
        if (!formData.startDate) validationErrors.startDate = 'Ngày đến là bắt buộc';
        if (!formData.endDate) validationErrors.endDate = 'Ngày đi là bắt buộc';
        if (!formData.roomId) validationErrors.roomId = 'Chọn phòng là bắt buộc';
        else if (selectedRoom && totalGuests > selectedRoom.capacity)
            validationErrors.guestCount = `Tổng số khách (người lớn + trẻ em) không được vượt quá ${selectedRoom.capacity}`;
        if (!formData.name) validationErrors.name = 'Tên là bắt buộc';
        if (!formData.phoneNumber) validationErrors.phoneNumber = 'Số điện thoại là bắt buộc';
        if (!formData.email) validationErrors.email = 'Email là bắt buộc';

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            console.log('Validation Errors:', validationErrors); // Log errors if validation fails
            return;
        }

        try {
            const startDate = formData.startDate ? new Date(formData.startDate) : null;
            const endDate = formData.endDate ? new Date(formData.endDate) : null;

            if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Ngày tháng không hợp lệ');
            }

            const numberOfNights = differenceInDays(endDate, startDate);
            const originalPrice = parseFloat(formData.totalAmount) || 0;
            const totalAmount = numberOfNights * originalPrice;
            const discountedPrice = parseFloat(formData.discountedPrice) || totalAmount;

            const roomIdString = formData.roomId ? String(formData.roomId) : '';
            const roomIds = roomIdString ? roomIdString.split(',').map((id) => parseInt(id.trim(), 10)) : [];

            console.log('formData.roomId:', formData.roomId);

            const bookingData = {
                checkInDate: format(startDate, 'dd/MM/yyyy'),
                checkOutDate: format(endDate, 'dd/MM/yyyy'),
                totalAmount: discountedPrice,
                guest: parseInt(formData.guestCount, 10) || 0,
                status: formData.status,
                roomId: roomIds,
                bookingName: formData.name,
                bookingEmail: formData.email,
                bookingPhone: formData.phoneNumber,
            };

            console.log('Booking Data:', bookingData); // Log the booking data before sending the API request

            const response = await axios.post('http://localhost:8080/admin/booking/create', bookingData, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            console.log('API Response:', response); // Log the API response for debugging

            if (role === 'admin') {
                navigate('/admin/booking');
            } else if (role === 'manager') {
                navigate('/manager/booking');
            } else if (role === 'employee') {
                navigate('/employee/booking');
            } else {
                navigate('/login'); // Default fallback
            }
        } catch (error) {
            console.error('Error creating booking:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Thêm Đặt Phòng</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="startDate" className="form-label">
                            Ngày đến:
                        </label>
                        <DatePicker
                            selected={formData.startDate}
                            onChange={handleStartDateChange}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                        />
                        {errors.startDate && <div className="text-danger">{errors.startDate}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="endDate" className="form-label">
                            Ngày đi:
                        </label>
                        <DatePicker
                            selected={formData.endDate}
                            onChange={handleEndDateChange}
                            minDate={formData.startDate ? formData.startDate : new Date()}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                        />
                        {errors.endDate && <div className="text-danger">{errors.endDate}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="roomId" className="form-label">
                            Chọn phòng:
                        </label>
                        <select
                            id="roomId"
                            name="roomId"
                            value={formData.roomId}
                            onChange={handleRoomChange}
                            className="form-select"
                        >
                            <option value="">Chọn phòng</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    Phòng {room.number} - {room.name} - {room.price.toLocaleString()} VNĐ -{' '}
                                    {room.capacity} người
                                </option>
                            ))}
                        </select>
                        {errors.roomId && <div className="text-danger">{errors.roomId}</div>}
                    </div>
                    {selectedRoom && (
                        <div className="mb-3">
                            <label className="form-label">Số người lớn:</label>
                            <input
                                type="number"
                                name="guestCount"
                                value={formData.guestCount}
                                onChange={handleChange}
                                className="form-control"
                                min="1"
                                max={selectedRoom.capacity}
                            />
                            {errors.guestCount && <div className="text-danger">{errors.guestCount}</div>}
                        </div>
                    )}
                    {selectedRoom && (
                        <div className="mb-3">
                            <label className="form-label">Số lượng trẻ em:</label>
                            <input
                                type="number"
                                name="childrenCount"
                                value={formData.numChildren}
                                onChange={handleChildrenCountChange}
                                className="form-control"
                                min="0"
                                max={selectedRoom.capacity}
                            />
                            {errors.numChildren && <div className="text-danger">{errors.numChildren}</div>}
                        </div>
                    )}
                    <div className="mb-3">
                        <label htmlFor="couponCode" className="form-label">
                            Mã giảm giá (tùy chọn):
                        </label>
                        <input
                            type="text"
                            id="couponCode"
                            name="couponCode"
                            value={formData.couponCode}
                            onChange={handleChange}
                            className="form-control"
                        />
                        <button type="button" onClick={handleApplyCoupon} className="btn btn-primary mt-2">
                            Áp dụng
                        </button>
                        {/* Hiển thị thông báo thành công khi có coupon và không có lỗi */}
                        {cusess.couponCode && <div className="text-success">{cusess.couponCode}</div>}

                        {/* Hiển thị thông báo lỗi khi có lỗi và không có coupon hợp lệ */}
                        {errors.couponCode && <div className="text-danger">{errors.couponCode}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="totalAmount" className="form-label">
                            Tổng số tiền:
                        </label>
                        <input
                            type="text"
                            id="totalAmount"
                            value={formData.totalAmount.toLocaleString()}
                            readOnly
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discountedPrice" className="form-label">
                            Số tiền sau giảm giá:
                        </label>
                        <input
                            type="text"
                            id="discountedPrice"
                            value={formData.discountedPrice}
                            readOnly
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            Họ và tên:
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                        />
                        {errors.name && <div className="text-danger">{errors.name}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                            Số điện thoại:
                        </label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="form-control"
                        />
                        {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                        />
                        {errors.email && <div className="text-danger">{errors.email}</div>}
                    </div>
                    <Link
                        to={
                            role === 'admin'
                                ? '/admin/booking'
                                : role === 'manager'
                                ? '/manager/booking'
                                : role === 'employee'
                                ? '/employee/booking'
                                : '/login'
                        }
                        className="btn btn-secondary"
                    >
                        Trở lại
                    </Link>
                    <button type="submit" className="btn btn-primary">
                        Đặt phòng
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddBooking;
