import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { Button } from 'primereact/button'; // Bạn có thể sử dụng Button từ PrimeReact hoặc bất kỳ thư viện UI nào bạn thích
import { Chart } from 'react-chartjs-2';
import 'react-datepicker/dist/react-datepicker.css';

const EmployeeDashboard = () => {
    // State cho dữ liệu thống kê và ngày bắt đầu, ngày kết thúc
    const [performanceData, setPerformanceData] = useState(null);
    const [startDate, setStartDate] = useState(new Date('2024-12-01'));
    const [endDate, setEndDate] = useState(new Date('2024-12-11'));

    // Lấy dữ liệu từ API
    const fetchPerformanceData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/performance/employee/4?startDate=${formatDate(
                    startDate,
                )}&endDate=${formatDate(endDate)}`,
            );
            setPerformanceData(response.data);
        } catch (error) {
            console.error('Error fetching performance data', error);
        }
    };

    // Hàm format date cho API
    const formatDate = (date) => {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Định dạng dữ liệu cho Chart.js
    const getChartData = () => {
        if (!performanceData) return {};

        return {
            labels: [
                'Tổng số yêu cầu',
                'Tỷ lệ thành công',
                'Thời gian xử lý trung bình',
                'Doanh thu',
                'Tổng số yêu cầu đã hủy',
            ],
            datasets: [
                {
                    label: 'Dữ liệu',
                    data: [
                        performanceData.totalHandled,
                        performanceData.successRate * 100, // Convert thành phần trăm
                        performanceData.avgProcessingTime,
                        performanceData.revenue / 1000, // Đơn vị là nghìn VNĐ
                        performanceData.totalCanceled,
                    ],
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.1,
                },
            ],
        };
    };

    // Định dạng options cho biểu đồ
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    // Hiển thị biểu đồ
    return (
        <div className="p-6">
            <div className="filter-container">
                {/* Form lọc ngày */}
                <div className="filter-item">
                    <label htmlFor="startDate" className="block">
                        Ngày bắt đầu:
                    </label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
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
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="date-picker"
                        maxDate={new Date()}
                    />
                </div>
                <div className="filter-item">
                    <Button label="Lọc" icon="pi pi-search" onClick={fetchPerformanceData} className="filter-button" />
                </div>
            </div>

            {/* Biểu đồ */}
            {performanceData ? (
                <div>
                    <h3 className="text-center mb-4">Biểu đồ Thống Kê Nhân Viên</h3>
                    <Chart type="line" data={getChartData()} options={chartOptions} />
                </div>
            ) : (
                <div>Loading chart data...</div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
