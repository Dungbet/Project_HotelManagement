import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import RoomList from './RoomList';
const EmployeeDashboard = () => {
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });

    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return tomorrow;
    });
    const [chartData, setChartData] = useState([]);
    const [performanceData, setPerformanceData] = useState({
        successRate: 0,
        avgProcessingTime: 0,
        revenue: 0,
        totalHandled: 0,
        totalCanceled: 0,
    });
    const [roomStats, setRoomStats] = useState({
        totalRooms: 0,
        bookedRooms: 0,
        emptyRooms: 0,
    });
    const [role, setRole] = useState(null);
    const getToken = () => localStorage.getItem('token');
    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);

                setRole(decoded.role); // Lấy giá trị 'sub' từ payload
                return decoded.userId;
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };

    // Fetch data function defined outside of useEffect
    const fetchData = async () => {
        const token = getToken();
        const userId = decodeToken();
        const response = await fetch(
            `http://localhost:8080/api/performance/performance-employee/${userId}?startDate=${formatDate(
                startDate,
            )}&endDate=${formatDate(endDate)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        const data = await response.json();
        setChartData(data);
        drawChart(data);
    };
    const fetchRoomStatistics = async () => {
        try {
            const token = getToken();

            const totalRoomsResponse = await fetch('http://localhost:8080/admin/booking/count-all-room', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const bookedRoomsResponse = await fetch('http://localhost:8080/admin/booking/count-room-booked', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const emptyRoomsResponse = await fetch('http://localhost:8080/admin/booking/count-room-empty', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const totalRooms = await totalRoomsResponse.json();
            const bookedRooms = await bookedRoomsResponse.json();
            const emptyRooms = await emptyRoomsResponse.json();

            setRoomStats({
                totalRooms: totalRooms.data,
                bookedRooms: bookedRooms.data,
                emptyRooms: emptyRooms.data,
            });
        } catch (error) {
            console.error('Error fetching room statistics:', error);
        }
    };
    // Fetch data function defined outside of useEffect
    const fetchDataPerformance = async () => {
        const token = getToken();
        const userId = decodeToken();
        const response = await fetch(
            `http://localhost:8080/api/performance/employee/${userId}?startDate=${formatDate(
                startDate,
            )}&endDate=${formatDate(endDate)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        const data = await response.json();
        setPerformanceData(data);
    };

    useEffect(() => {
        decodeToken();
        fetchDataPerformance();
        // Fetch data when component mounts or when dates change
        fetchData();
        fetchRoomStatistics();
    }, [startDate, endDate]);

    // Format the date to the format expected by API
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const drawChart = (data) => {
        const labels = data.map((item) => item.date.split('T')[0]);
        const totalHandled = data.map((item) => item.totalHandled);
        const avgProcessingTime = data.map((item) => item.avgProcessingTime);
        const revenue = data.map((item) => item.revenue);
        const totalCanceled = data.map((item) => item.totalCanceled);
        const successRate = data.map((item) => item.successRate);

        // Get the canvas element
        const canvas = document.getElementById('myChart');

        // If a chart already exists, destroy it before creating a new one
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        // Create or update the chart
        const newChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tổng Booking',
                        data: totalHandled,
                        borderColor: 'red',
                        fill: false,
                    },
                    {
                        label: 'Thời gian xử lý TB',
                        data: avgProcessingTime,
                        borderColor: 'green',
                        fill: false,
                    },
                    {
                        label: 'Doanh Thu',
                        data: revenue,
                        borderColor: 'blue',
                        fill: false,
                    },
                    {
                        label: 'Tổng hủy',
                        data: totalCanceled,
                        borderColor: 'orange',
                        fill: false,
                    },
                    {
                        label: 'Tỷ lệ thành công',
                        data: successRate,
                        borderColor: 'purple',
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                legend: { display: true },
            },
        });

        // Store the chart object on the canvas element to be used for future destruction
        canvas.chart = newChart;
    };

    const handleStartDateChange = (date) => setStartDate(date);
    const handleEndDateChange = (date) => setEndDate(date);
    const handleFilter = () => {
        // Trigger fetch with the new startDate and endDate when filter is applied
        fetchData();
    };

    return (
        <div className="container-fluid pt-4">
            <h3
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '20px',
                    textAlign: 'center',
                    padding: '10px',
                    borderBottom: '2px solid #007bff',
                    // marginTop: '50px',
                }}
            >
                Hiệu suất cá nhân
            </h3>

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
                        maxDate={new Date()}
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
                        minDate={startDate}
                        maxDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
                    />
                </div>

                <div className="filter-item">
                    <button onClick={handleFilter} className="filter-button">
                        Lọc
                    </button>
                </div>
            </div>
            <div className="room-empty row g-4">
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-check-circle fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tỷ lệ thành công</p>
                            <h3 className="mb-0 text-center">
                                {performanceData.successRate ? (performanceData.successRate * 100).toFixed(2) : 0} %
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-clock fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Xử lý trung bình (phút)</p>
                            <h3 className="mb-0 text-center">{performanceData.avgProcessingTime || '0'}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-dollar-sign fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Doanh thu</p>
                            <h3 className="mb-0 text-center">
                                {performanceData.revenue ? performanceData.revenue.toLocaleString() : '0'}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-calendar-check fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Số Booking</p>
                            <h3 className="mb-0 text-center">{performanceData.totalHandled || '0'}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-times-circle fa-3x text-danger"></i>
                        <div className="ms-3">
                            <p className="mb-2">Đã hủy</p>
                            <h3 className="mb-0 text-center">{performanceData.totalCanceled || '0'}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-book fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tổng Booking</p>
                            <h3 className="mb-0 text-center">
                                {performanceData.totalCanceled + performanceData.totalHandled || '0'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            <canvas id="myChart" style={{ width: '100%', maxWidth: '600px' }}></canvas>

            <h3
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '20px',
                    textAlign: 'center',
                    padding: '10px',
                    borderBottom: '2px solid #007bff',
                    marginTop: '50px',
                }}
            >
                Thống kê phòng
            </h3>
            <div className="room-empty row g-4">
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-bed fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tổng số phòng</p>
                            <h3 className="mb-0 text-center">{roomStats.totalRooms}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-check-circle fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Số phòng đã đặt</p>
                            <h3 className="mb-0 text-center">{roomStats.bookedRooms}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-door-open fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Số phòng trống</p>
                            <h3 className="mb-0 text-center">{roomStats.emptyRooms}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid pt-4 px-4">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="bg-light text-center rounded p-4">
                            <h3>Thống kê phòng hôm nay</h3>
                            <div className="chart-container">
                                <Pie
                                    data={{
                                        labels: ['Đã đặt', 'Trống'],
                                        datasets: [
                                            {
                                                data: [roomStats.bookedRooms, roomStats.emptyRooms],
                                                backgroundColor: ['#007bff', '#ff6600'],
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        title: {
                                            display: true,
                                            text: 'Thống kê phòng hôm nay',
                                        },
                                        maintainAspectRatio: false,
                                    }}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-light text-center rounded p-4">
                        {/* <h3>Danh sách phòng</h3> */}
                        {/* Thêm RoomList tại đây */}
                        <RoomList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
