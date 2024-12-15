import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';

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
        <div>
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
                <div className="col-sm-6 col-xl-3">
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
                <div className="col-sm-6 col-xl-3">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-clock fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Xử lý trung bình (phút)</p>
                            <h3 className="mb-0 text-center">{performanceData.avgProcessingTime || '0'}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
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
                <div className="col-sm-6 col-xl-3">
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                        <i className="fa fa-calendar-check fa-3x text-primary"></i>
                        <div className="ms-3">
                            <p className="mb-2">Tổng booking</p>
                            <h3 className="mb-0 text-center">{performanceData.totalHandled || '0'}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <canvas id="myChart" style={{ width: '100%', maxWidth: '600px' }}></canvas>
        </div>
    );
};

export default EmployeeDashboard;
