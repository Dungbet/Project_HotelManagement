import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditBooking() {
    const { bookingId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        roomId: '',
        userId: '',
        startDate: '',
        endDate: '',
        specialRequests: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoomsAndUsers = async () => {
            try {
                const roomsResponse = await axios.get('http://localhost:8080/room/');
                const usersResponse = await axios.get('http://localhost:8080/user/');
                setRooms(roomsResponse.data.data);
                setUsers(usersResponse.data.data);
            } catch (error) {
                console.error('Error fetching rooms or users', error);
            }
        };

        const fetchBooking = async () => {
            try {
                const bookingResponse = await axios.get(`http://localhost:8080/booking/${bookingId}`);
                setFormData(bookingResponse.data.data);
            } catch (error) {
                console.error('Error fetching booking data', error);
            }
        };

        fetchRoomsAndUsers();
        fetchBooking();
    }, [bookingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`http://localhost:8080/admin/booking/update/${bookingId}`, formData);
            console.log('Booking updated successfully');
            navigate('/admin/booking');
        } catch (error) {
            console.error('Error updating booking', error);
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Sửa Đặt Phòng</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="roomId" className="form-label">
                            Phòng
                        </label>
                        <select
                            className="form-control"
                            id="roomId"
                            name="roomId"
                            value={formData.roomId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn phòng</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name} - {room.roomNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="userId" className="form-label">
                            Người dùng
                        </label>
                        <select
                            className="form-control"
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn người dùng</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username} - {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="startDate" className="form-label">
                            Ngày bắt đầu
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="endDate" className="form-label">
                            Ngày kết thúc
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="specialRequests" className="form-label">
                            Yêu cầu đặc biệt
                        </label>
                        <textarea
                            className="form-control"
                            id="specialRequests"
                            name="specialRequests"
                            value={formData.specialRequests}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Cập nhật
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditBooking;
