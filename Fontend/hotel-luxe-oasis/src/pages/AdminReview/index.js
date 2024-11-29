import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';

function AdminReview() {
    const [reviews, setReviews] = useState([]);
    const [messages, setMessages] = useState({
        deleteMessageSuccess: '',
        deleteMessageFail: '',
    });
    const [endPage, setEndPage] = useState(1);
    const [page, setPage] = useState(0); // Current page
    const size = 10; // Number of reviews per page
    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/admin/review/get-all?page=${page}&size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setReviews(response.data.data.data);
            setEndPage(response.data.data.totalPages);
        } catch (error) {
            console.error('Error fetching reviews', error);
        }
    };

    const deleteReview = async (id) => {
        const token = getToken();
        if (window.confirm('Bạn có đồng ý xóa đánh giá này?')) {
            try {
                await axios.delete(`http://localhost:8080/admin/review/delete?id=${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages({ ...messages, deleteMessageSuccess: 'Xóa đánh giá thành công' });
                fetchReviews();
            } catch (error) {
                setMessages({ ...messages, deleteMessageFail: 'Xóa đánh giá thất bại' });
                console.error('Error deleting review', error);
            }
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={index < rating ? 'text-warning' : 'text-secondary'}>
                ★
            </span>
        ));
    };

    const formatDate = (dateString) => {
        try {
            // Kiểm tra nếu dateString không phải là null hoặc undefined
            if (!dateString) {
                return 'N/A'; // Hoặc xử lý theo cách bạn muốn
            }

            // Nếu ngày đã được định dạng như "28/10/2024 13:57"
            const parsedDate = parse(dateString, 'dd/MM/yyyy HH:mm', new Date());

            return format(parsedDate, 'dd/MM/yyyy HH:mm'); // format lại theo định dạng mong muốn
        } catch (e) {
            console.error('Date parsing error:', e);
            return 'N/A'; // Hoặc xử lý lỗi theo cách bạn muốn
        }
    };
    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Quản Lý Đánh Giá</h6>
                </div>
                <p className="text-success">{messages.deleteMessageSuccess}</p>
                <p className="text-danger">{messages.deleteMessageFail}</p>
                <div className="table-responsive">
                    <table className="table text-start align-middle table-hover table-striped mb-0">
                        <thead>
                            <tr className="text-dark">
                                <th scope="col">ID Đánh Giá</th>
                                <th scope="col">Ngày Tạo</th>
                                <th scope="col">ID Người Dùng</th>
                                {/* <th scope="col">ID Đặt Phòng</th> */}
                                <th scope="col">ID Phòng</th>
                                <th scope="col">Rate</th>
                                <th scope="col">Comment</th>
                                <th scope="col">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) =>
                                review.booking && review.booking.rooms.length > 0 ? (
                                    review.booking.rooms.map((room, index) => (
                                        <tr key={`${review.id}-${room.id}-${index}`}>
                                            <td>{review.id}</td>
                                            <td>{formatDate(review.createAt)}</td>
                                            <td>{review.booking.user.id}</td>
                                            {/* Hiển thị ID phòng */}
                                            <td>{room.id}</td>
                                            <td>{renderStars(review.rating)}</td>
                                            <td>{review.comment}</td>
                                            <td>
                                                <a onClick={() => deleteReview(review.id)}>
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Nếu không có phòng, hiển thị dòng với N/A
                                    <tr key={review.id}>
                                        <td>{review.id}</td>
                                        <td>{formatDate(review.createAt)}</td>
                                        <td>{review.booking.user.id}</td>
                                        <td>N/A</td>
                                        <td>{renderStars(review.rating)}</td>
                                        <td>{review.comment}</td>
                                        <td>
                                            <a onClick={() => deleteReview(review.id)}>
                                                <i className="fa-solid fa-trash-can"></i>
                                            </a>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-center">
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item">
                                    <button className="page-link" onClick={() => setPage(0)} aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
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

export default AdminReview;
