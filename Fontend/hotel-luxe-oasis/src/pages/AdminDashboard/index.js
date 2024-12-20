import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays, isBefore } from 'date-fns';
// Import RoomList
import RoomList from './RoomList';
import UserChart from './UserChart';
import MostRooms from './MostRooms';
import EmployeePerformanceDashboard from './EmployeePerformanceDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import { jwtDecode } from 'jwt-decode';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [todayOrderCount, setTodayOrderCount] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [roomStats, setRoomStats] = useState({
        totalRooms: 0,
        bookedRooms: 0,
        emptyRooms: 0,
    });
    const [userStats, setUserStats] = useState({
        totalUser: 0,
        userNew: 0,
        growth: 0,
    });
    const [role, setRole] = useState(null);
    const [canceledBooking, setCanceledBooking] = useState(0);

    useEffect(() => {
        fetchTodayStatistics();
        fetchRoomStatistics();
        fetchUserStatistics();
        decodeToken();
    }, []);

    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Full decoded token:', decoded); // In toàn bộ payload

                // Kiểm tra chính xác key lưu role
                setRole(decoded.role); // Thử với key khác nếu cần

                return decoded.userId;
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };

    const getToken = () => localStorage.getItem('token');

    const fetchTodayStatistics = async () => {
        const url = `http://localhost:8080/admin/booking/statistics-day`;

        try {
            const token = getToken();
            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const result = await response.json();
            console.log('API response:', result);
            setTodayOrderCount(result.data.countBooking);
            setTodayRevenue(result.data.totalAmount);
            setCanceledBooking(result.data.countCancel);
            setChartData(formatChartData([result.data]));
        } catch (error) {
            console.error('Error fetching today statistics:', error);
        }
    };

    const fetchChartData = async () => {
        const start = format(startDate, 'dd/MM/yyyy');
        const end = format(endDate, 'dd/MM/yyyy');
        const url = `http://localhost:8080/admin/booking/count-by-date?startDate=${start}&endDate=${end}`;

        try {
            const token = getToken();
            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const result = await response.json();
            console.log('API response:', result);
            setChartData(formatChartData(result.data));
            updateSummary(result.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
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

    const fetchUserStatistics = async () => {
        try {
            const token = getToken();

            const totalUserRes = await fetch('http://localhost:8080/admin/user/get-all-user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userNewRes = await fetch('http://localhost:8080/admin/user/get-new-user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const growthRes = await fetch('http://localhost:8080/admin/user/get-growth-user', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const totalUser = await totalUserRes.json();
            const userNew = await userNewRes.json();
            const growth = await growthRes.json();

            setUserStats({
                totalUser: totalUser.data,
                userNew: userNew.data,
                growth: growth.data,
            });
        } catch (error) {
            console.error('Error fetching room statistics:', error);
        }
    };

    const formatChartData = (data) => {
        if (!Array.isArray(data)) {
            console.error('Invalid data format:', data);
            return { labels: [], datasets: [] };
        }

        const labels = data.map((item) => item.createAt);
        const revenueData = data.map((item) => item.totalAmount);
        const orderCountData = data.map((item) => item.countBooking);
        const canceledData = data.map((item) => item.countCancel);

        return {
            labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Doanh thu',
                    data: revenueData,
                    backgroundColor: '#009CFF',
                    borderColor: '#009CFF',
                    borderWidth: 1,
                },
                {
                    type: 'line',
                    label: 'Số lượng booking',
                    data: orderCountData,
                    backgroundColor: '#0dcaf0',
                    borderColor: '#0dcaf0',
                    fill: false,
                },
                {
                    type: 'line',
                    label: 'Số booking đã hủy', // Thêm dataset cho số booking đã hủy
                    data: canceledData,
                    backgroundColor: '#FF0000',
                    borderColor: '#FF0000',
                    fill: false,
                },
            ],
        };
    };

    const updateSummary = (data) => {
        const totalBookings = data.reduce((acc, item) => acc + item.countBooking, 0);
        const totalRevenue = data.reduce((acc, item) => acc + item.totalAmount, 0);
        const totalCanceled = data.reduce((acc, item) => acc + item.countCancel, 0);
        setTodayOrderCount(totalBookings);
        setTodayRevenue(totalRevenue);
        setCanceledBooking(totalCanceled);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const handleStartDateChange = (date) => {
        if (isBefore(date, endDate)) {
            setStartDate(date);
        }
    };

    const handleEndDateChange = (date) => {
        if (isBefore(startDate, date)) {
            setEndDate(date);
        }
    };

    const exportExcel = async () => {
        const start = format(startDate, 'dd/MM/yyyy');
        const end = format(endDate, 'dd/MM/yyyy');
        const url = `http://localhost:8080/admin/booking/export-excel?startDate=${start}&endDate=${end}`;

        try {
            const token = getToken();
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                method: 'GET',
            });

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'bookings.xlsx';
                link.click();
            } else {
                console.error('Error exporting data:', response.statusText);
            }
        } catch (error) {
            console.error('Error exporting Excel:', error);
        }
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
                Thống kê doanh thu
            </h3>
            <div className="row g-4">
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-chart-area fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tổng booking</p>
                            <h3 className="mb-0 text-center">{todayOrderCount}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-times-circle fa-3x text-danger"></i>
                        <div className="ms-3">
                            <p className="mb-2">Đã hủy</p>
                            <h3 className="mb-0 text-center">{canceledBooking}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-chart-pie fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Doanh thu</p>
                            <h3 className="mb-0 text-center">{formatCurrency(todayRevenue)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid pt-4 px-4">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="bg-light text-center rounded p-4">
                            <h3>Doanh thu và số lượng booking theo ngày</h3>
                            <div className="text-end d-flex justify-content-end align-items-center">
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleStartDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    className="py-1 px-3 rounded me-2"
                                    maxDate={new Date()}
                                />
                                <DatePicker
                                    selected={endDate}
                                    onChange={handleEndDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    className="py-1 px-3 rounded me-2"
                                    maxDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
                                />
                                <button type="button" className="btn btn-primary px-3" onClick={fetchChartData}>
                                    <i className="fa-solid fa-filter me-2" style={{ color: '#ffffff' }}></i>Lọc
                                </button>
                                <button type="button" className="btn btn-success px-3 ms-2" onClick={exportExcel}>
                                    <i className="fa-solid fa-download me-2" style={{ color: '#ffffff' }}></i> Xuất
                                    Excel
                                </button>
                            </div>
                            <div>
                                <Bar data={chartData} />
                                {/* <Line data={chartData} /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                Thống kê người dùng
            </h3>
            <div className="room-empty row g-4">
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-user-plus fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Khách hàng mới</p>
                            <h3 className="mb-0 text-center">{userStats.userNew}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-arrow-up fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tỷ lệ tăng trưởng</p>
                            <h3 className="mb-0 text-center">{userStats.growth}%</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-users fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tổng khách hàng</p>
                            <h3 className="mb-0 text-center">{userStats.totalUser}</h3>
                        </div>
                    </div>
                </div>
                <div className="container-fluid pt-4 px-4">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="bg-light text-center rounded p-4">
                                <h3>Thống kê người dùng</h3>
                                {/* Thêm UserChart vào đây */}
                                <UserChart userStats={userStats} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="room-empty row g-4">
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
                    Phòng được đặt nhiều
                </h3>
                <MostRooms />
            </div>
            {role === 'manager' && (
                <div className="room-empty row g-4">
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
                        Hiệu suất của nhân viên
                    </h3>
                    <EmployeePerformanceDashboard />
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
