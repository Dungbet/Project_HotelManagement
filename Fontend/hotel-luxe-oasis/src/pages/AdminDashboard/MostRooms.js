import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';
const MostRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const getToken = () => localStorage.getItem('token');

    const handleStartDateChange = (date) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };
    // Hàm gọi API mặc định (không lọc)
    const fetchDefaultRooms = () => {
        const token = getToken();
        const url = 'http://localhost:8080/admin/room/get-all-most-rooms';

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.status === 200) {
                    setRooms(data.data);
                } else {
                    console.error('Failed to fetch rooms:', data.msg);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    };

    const handleFilter = () => {
        if (!startDate || !endDate) {
            alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
            return;
        }

        const formattedStartDate = startDate.toLocaleDateString('en-GB');
        const formattedEndDate = endDate.toLocaleDateString('en-GB');

        const token = getToken();
        const url = `http://localhost:8080/admin/room/most-rooms?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.status === 200) {
                    setRooms(data.data);
                } else {
                    console.error('Failed to fetch rooms:', data.msg);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    };
    useEffect(() => {
        fetchDefaultRooms();
    }, []);
    return (
        <div>
            <div className="p-4">
                {/* Form để chọn ngày bắt đầu và ngày kết thúc */}
                <div className="filter-container">
                    <div className="filter-item">
                        <label htmlFor="startDate" className="block">
                            Ngày bắt đầu:
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker"
                        />
                    </div>
                    <div className="filter-item">
                        <label htmlFor="endDate" className="block">
                            Ngày kết thúc:
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker"
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="filter-item">
                        <Button label="Lọc" icon="pi pi-search" onClick={handleFilter} className="filter-button" />
                    </div>
                </div>
            </div>

            {/* Hiển thị danh sách thẻ */}
            {/* Hiển thị danh sách thẻ */}
            <div className="flex flex-wrap gap-3 justify-content-center">
                {rooms.map((room, index) => (
                    <div className="room-card" key={index}>
                        <Card className="shadow-2 border-round" style={{ width: '300px' }}>
                            <Image src={room.url} alt={room.nameRooms} className="rounded-top" />
                            <div className="p-4">
                                <h2 className="font-bold text-xl mb-2">{room.nameRooms}</h2>
                                <p className="text-500 text-base mb-4">Room {room.numberRoom}</p>
                                <h3 className="text-2xl font-bold mb-4">
                                    {room.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </h3>
                                <p className="text-500 text-base mb-4">Tổng booking: {room.countBooked}</p>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MostRooms;
