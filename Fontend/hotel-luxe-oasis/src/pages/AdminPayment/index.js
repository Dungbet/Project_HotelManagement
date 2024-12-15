import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminPayment() {
    const [payments, setPayments] = useState([]);
    const [messages, setMessages] = useState({
        addMessageSuccess: '',
        addMessageFail: '',
        deleteMessageSuccess: '',
        deleteMessageFail: '',
    });
    const [endPage, setEndPage] = useState(1);
    const [page, setPage] = useState(0); // Current page
    const size = 10; // Number of payments per page
    const navigate = useNavigate();
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

    useEffect(() => {
        fetchPayments();
        decodeToken();
    }, [page]);

    useEffect(() => {
        if (role === null) return; // Skip if role is not determined yet
        fetchPayments();
    }, [role]);

    const fetchPayments = async () => {
        try {
            const token = getToken();

            let url;
            if (role === 'employee') {
                console.log('da dang nhạp employee');
                const employeeId = decodeToken(); // Lấy employeeId từ token
                url = `http://localhost:8080/admin/payment/?page=${page}&size=${size}&employeeId=${employeeId}`;
            } else {
                console.log('da dang nhạp manager');
                url = `http://localhost:8080/admin/payment/?page=${page}&size=${size}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPayments(response.data.data.data);
            setEndPage(response.data.data.totalPages);
        } catch (error) {
            console.error('Error fetching payments', error);
        }
    };

    const deletePayment = async (id) => {
        const token = getToken();
        if (window.confirm('Bạn có đồng ý xóa giao dịch này?')) {
            try {
                await axios.delete(`http://localhost:8080/admin/payment/?id=${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages({ ...messages, deleteMessageSuccess: 'Xóa giao dịch thành công' });
                fetchPayments();
            } catch (error) {
                setMessages({ ...messages, deleteMessageFail: 'Xóa giao dịch thất bại' });
                console.error('Error deleting payment', error);
            }
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Quản Lý Giao Dịch</h6>
                    {role === 'admin' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate('/admin/add-payment')}>
                            Thêm Giao Dịch
                        </button>
                    ) : role === 'manager' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate('/manager/add-payment')}>
                            Thêm Giao Dịch
                        </button>
                    ) : role === 'employee' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate('/employee/add-payment')}>
                            Thêm Giao Dịch
                        </button>
                    ) : null}
                </div>
                <p className="text-success">{messages.addMessageSuccess}</p>
                <p className="text-danger">{messages.addMessageFail}</p>
                <p className="text-success">{messages.deleteMessageSuccess}</p>
                <p className="text-danger">{messages.deleteMessageFail}</p>
                <div className="table-responsive">
                    <table className="table text-start align-middle table-hover table-striped mb-0">
                        <thead>
                            <tr className="text-dark">
                                <th scope="col">ID</th>
                                <th scope="col">Phòng Số</th>
                                <th scope="col">Ngày Thanh Toán</th>
                                <th scope="col">Số Tiền</th>
                                <th scope="col">Phương Thức Thanh Toán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>

                                    <td>
                                        {payment.booking && payment.booking.rooms && payment.booking.rooms.length > 0
                                            ? payment.booking.rooms.map((room) => room.roomNumber).join(' & ')
                                            : 'N/A'}
                                    </td>
                                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td>{payment.amount}</td>
                                    <td>{payment.paymentMethod}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-center">
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item">
                                    <button className="page-link" onClick={() => setPage(0)} aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
                                        <span className="sr-only">Previous</span>
                                    </button>
                                </li>
                                {Array.from({ length: endPage }, (_, i) => i + 1).map((i) => (
                                    <li key={i} className="page-item">
                                        <button className="page-link" onClick={() => setPage(i - 1)}>
                                            {i}
                                        </button>
                                    </li>
                                ))}
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(endPage - 1)}
                                        aria-label="Next"
                                    >
                                        <span aria-hidden="true">&raquo;</span>
                                        <span className="sr-only">Next</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPayment;
