import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
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
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays, isBefore } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function AdminDashboard() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [todayOrderCount, setTodayOrderCount] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);

    useEffect(() => {
        fetchTodayStatistics();
    }, []);

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

    const formatChartData = (data) => {
        if (!Array.isArray(data)) {
            console.error('Invalid data format:', data);
            return { labels: [], datasets: [] };
        }

        const labels = data.map((item) => item.createAt);
        const revenueData = data.map((item) => item.totalAmount);
        const orderCountData = data.map((item) => item.countBooking);

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
            ],
        };
    };

    const updateSummary = (data) => {
        const totalBookings = data.reduce((acc, item) => acc + item.countBooking, 0);
        const totalRevenue = data.reduce((acc, item) => acc + item.totalAmount, 0);
        setTodayOrderCount(totalBookings);
        setTodayRevenue(totalRevenue);
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
            <div className="row g-4">
                <div className="col-sm-6 col-xl-6">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-chart-area fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Số lượng booking</p>
                            <h3 className="mb-0 text-center">{todayOrderCount}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-6">
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
                                />
                                <DatePicker
                                    selected={endDate}
                                    onChange={handleEndDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    className="py-1 px-3 rounded me-2"
                                    maxDate={new Date()}
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
        </div>
    );
}

export default AdminDashboard;
