import React, { useState, useEffect } from 'react';
import { Trophy, Star, Clock, CheckCircle, CreditCard, XCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from 'primereact/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';
const EmployeePerformanceDashboard = () => {
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });

    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return tomorrow;
    });
    const [employees, setEmployees] = useState([]);
    const [performanceData, setPerformanceData] = useState({});
    const [loading, setLoading] = useState(false);

    const handleStartDateChange = (date) => setStartDate(date);
    const handleEndDateChange = (date) => setEndDate(date);

    // Lấy token từ localStorage
    const getToken = () => localStorage.getItem('token');

    // Lấy danh sách nhân viên
    const fetchEmployees = async () => {
        try {
            const token = getToken();
            const userId = JSON.parse(atob(token.split('.')[1])).userId;

            const response = await axios.get(`http://localhost:8080/admin/user/search-user-by-manager`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { managerId: userId },
            });

            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Lấy dữ liệu hiệu suất nhân viên
    const fetchPerformanceData = async () => {
        setLoading(true);
        const formattedStartDate = startDate.toLocaleDateString('en-GB');
        const formattedEndDate = endDate.toLocaleDateString('en-GB');

        try {
            const token = getToken();
            const promises = employees.map((employee) =>
                axios
                    .get(`http://localhost:8080/api/performance/employee/${employee.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { startDate: formattedStartDate, endDate: formattedEndDate },
                    })
                    .then((res) => ({ id: employee.id, data: res.data })),
            );

            const results = await Promise.all(promises);
            const performanceDataMap = results.reduce((acc, curr) => {
                acc[curr.id] = curr.data;
                return acc;
            }, {});

            setPerformanceData(performanceDataMap);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setLoading(false);
        }
    };

    // Tải danh sách nhân viên khi component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    return (
        <div className="dashboard-container">
            {/* <h2 className="dashboard-header">Bảng Thành Tích Nhân Viên</h2> */}

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
                        <Button
                            label="Lọc"
                            icon="pi pi-search"
                            onClick={fetchPerformanceData}
                            className="filter-button"
                        />
                    </div>
                </div>
            </div>

            {/* Employees Performance List */}
            {employees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((employee, index) => (
                        <div
                            key={employee.id}
                            className={`mb-4 p-4 border rounded-lg ${
                                index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{employee.name || employee.username}</h3>
                                    <p className="text-gray-600">Mã nhân viên: {employee.id}</p>
                                </div>
                                {/* {index === 0 && <Trophy className="text-yellow-500" size={40} />} */}
                            </div>

                            {performanceData[employee.id] ? (
                                <div className="epd-container mb-4">
                                    <div className="epd-item">
                                        <CheckCircle
                                            style={{ color: 'rgb(34 197 94)' }}
                                            className="text-green-500"
                                            size={20}
                                        />
                                        <div>
                                            <p className="font-medium">Tỷ lệ thành công</p>
                                            <p className="font-bold">
                                                {(performanceData[employee.id].successRate * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="epd-item">
                                        <Clock
                                            className="text-blue-500"
                                            size={20}
                                            style={{ color: 'rgb(59 130 246)' }}
                                        />
                                        <div>
                                            <p className="font-medium">Thời gian XL TB</p>
                                            <p className="font-bold">
                                                {performanceData[employee.id].avgProcessingTime} phút
                                            </p>
                                        </div>
                                    </div>

                                    <div className="epd-item">
                                        <CreditCard
                                            className="text-purple-500 "
                                            style={{ color: 'rgb(168 85 247)' }}
                                            size={20}
                                        />
                                        <div>
                                            <p className="font-medium">Doanh thu</p>
                                            <p className="font-bold">
                                                {performanceData[employee.id].revenue.toLocaleString()} VND
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Chưa có dữ liệu</p>
                            )}
                            <div className="mt-4 flex justify-between">
                                <div className="flex items-center">
                                    <Star
                                        className="inline-block mr-2 text-orange-500"
                                        size={20}
                                        style={{ color: 'rgb(249 115 22)' }}
                                    />
                                    <span>Tổng booking: {performanceData[employee.id]?.totalHandled || 0}</span>
                                </div>
                                <div className="flex items-center">
                                    <XCircle
                                        className="inline-block mr-2 text-red-500"
                                        size={20}
                                        style={{ color: 'rgb(239 68 68)' }}
                                    />

                                    <span className="text-red-500" style={{ color: 'rgb(239 68 68)' }}>
                                        Đã hủy: {performanceData[employee.id]?.totalCanceled || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">Không có nhân viên nào</p>
            )}
        </div>
    );
};

export default EmployeePerformanceDashboard;
