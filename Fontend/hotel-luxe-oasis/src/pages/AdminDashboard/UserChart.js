import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const UserChart = () => {
    const getToken = () => localStorage.getItem('token');
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const token = getToken();
        // Gọi API để lấy dữ liệu
        axios
            .get('http://localhost:8080/admin/user/count-user-day', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                const apiData = response.data.data;

                // Tách labels (ngày) và data (số lượng)
                const labels = apiData.map((item) => item[0]);
                const data = apiData.map((item) => item[1]);

                // Cập nhật dữ liệu cho biểu đồ
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Số lượng người dùng theo ngày',
                            data: data,
                            fill: false,
                            backgroundColor: 'rgba(0,0,255,1.0)',
                            borderColor: 'rgba(0,0,255,0.3)',
                            tension: 0.1,
                        },
                    ],
                });
            })
            .catch((error) => {
                console.error('Lỗi khi gọi API:', error);
            });
    }, []);

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}>
            <Line
                data={chartData}
                options={{
                    scales: {
                        yAxes: [
                            {
                                ticks: { beginAtZero: true },
                            },
                        ],
                    },
                    plugins: {
                        legend: { display: true },
                    },
                }}
            />
        </div>
    );
};

export default UserChart;
