import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

function AdminBooking() {
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [messages, setMessages] = useState({
        deleteMessageFail: '',
        deleteMessageSuccess: '',
    });

    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        onConfirm: null,
    });
    const [endPage, setEndPage] = useState(1);
    const [page, setPage] = useState(0); // Current page
    const size = 10; // Number of bookings per page
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, [page]);
    useEffect(() => {
        if (message.text) {
            const timeout = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timeout);
        }
    }, [message]);

    // Hàm lấy token từ localStorage
    const getToken = () => localStorage.getItem('token');
    const fetchBookings = async () => {
        try {
            const token = getToken();

            const response = await axios.get(`http://localhost:8080/admin/booking/?page=${page}&size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBookings(response.data.data.data);
            setEndPage(response.data.data.totalPages);
        } catch (error) {
            console.error('Error fetching bookings', error);
        }
    };
    const handleDialogClose = () => {
        setDialog({ open: false, title: '', content: '', onConfirm: null });
    };

    const handleDeleteBooking = async (bookingId, status) => {
        if (status === 'Đã hủy') {
            setMessages({
                ...messages,
                deleteMessageFail: 'Không thể xóa đặt phòng đã thanh toán',
                deleteMessageSuccess: '',
            });
            return;
        }

        setDialog({
            open: true,
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa không?',
            onConfirm: async () => {
                try {
                    const token = getToken();
                    await axios.delete(`http://localhost:8080/admin/booking/?id=${bookingId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setMessage({ type: 'success', text: 'Xóa đặt phòng thành công' });
                    fetchBookings();
                } catch (error) {
                    setMessage({ type: 'danger', text: 'Xóa đặt phòng thất bại' });
                    console.error('Error deleting booking', error);
                }
                handleDialogClose();
            },
        });
    };

    const handleFinishBooking = async (bookingId, bookingStatus) => {
        if (bookingStatus === 'Chưa thanh toán') {
            setDialog({
                open: true,
                title: 'Thông báo',
                content: 'Phòng chưa thanh toán',
            });
            return;
        }

        setDialog({
            open: true,
            title: 'Xác nhận hoàn thành',
            content: 'Bạn có chắc chắn muốn hoàn thành không?',
            onConfirm: async () => {
                try {
                    const token = getToken();
                    await axios.put(
                        'http://localhost:8080/admin/booking/finish-booking',
                        { id: bookingId },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                    setMessage({ type: 'success', text: 'Hoàn thành đặt phòng thành công' });
                    fetchBookings();
                } catch (error) {
                    setMessage({ type: 'danger', text: 'Hoàn thành đặt phòng thất bại' });
                    console.error('Error finishing booking', error);
                }
                handleDialogClose();
            },
        });
    };

    // const confirmCancelBooking = async (bookingId, confirm) => {
    //     const confirmConfirm = window.confirm('Bạn có chắc chắn muốn xác nhận không?');
    //     if (!confirmConfirm) return;

    //     try {
    //         const token = getToken();
    //         await axios.put(
    //             'http://localhost:8080/admin/booking/confirm-cancel',
    //             { id: bookingId },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //                 params: { confirm }, // Truyền tham số confirm từ hàm
    //             },
    //         );
    //         setMessages({ ...messages, updateMessageSuccess: 'Xác nhận hủy thành công' });
    //         fetchBookings();
    //     } catch (error) {
    //         setMessages({ ...messages, updateMessageFail: 'Xác nhận hủy thất bại' });
    //         console.error('Error confirming cancel booking', error);
    //     }
    // };

    const handleCancelBooking = async (bookingId, confirm) => {
        setDialog({
            open: true,
            title: 'Xác nhận hủy đặt',
            content: 'Bạn có chắc chắn muốn hủy đặt không?',
            onConfirm: async () => {
                try {
                    const token = getToken();
                    await axios.put(
                        'http://localhost:8080/admin/booking/confirm-cancel',
                        { id: bookingId },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { confirm },
                        },
                    );
                    setMessages({ ...messages, deleteMessageSuccess: 'Xác nhận hủy đặt phòng thành công' });
                    fetchBookings();
                } catch (error) {
                    setMessages({ ...messages, deleteMessageFail: 'Xác nhận hủy đặt phòng thất bại' });
                    console.error('Error cancelling booking', error);
                }
                handleDialogClose();
            },
        });
    };
    const handleCancelBookingAdmin = async (bookingId) => {
        setDialog({
            open: true,
            title: 'Xác nhận hủy',
            content: 'Bạn có chắc chắn muốn hủy không?',
            onConfirm: async () => {
                try {
                    const token = getToken();
                    await axios.put(
                        'http://localhost:8080/admin/booking/cancel-booking',
                        { id: bookingId },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                    setMessages({ ...messages, deleteMessageSuccess: 'Hủy đặt thành công' });
                    fetchBookings();
                } catch (error) {
                    setMessages({ ...messages, deleteMessageFail: 'Hủy đặt thất bại' });
                    console.error('Error cancelling booking', error);
                }
                handleDialogClose();
            },
        });
    };

    // Convert date string from "dd/MM/yyyy" to JavaScript Date object
    const parseDate = (dateString) => {
        if (!dateString) return null;
        return parse(dateString, 'dd/MM/yyyy', new Date(), { locale: vi });
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <Dialog open={dialog.open} onClose={handleDialogClose}>
                <DialogTitle>{dialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialog.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Hủy</Button>
                    {dialog.onConfirm && <Button onClick={dialog.onConfirm}>Xác nhận</Button>}
                </DialogActions>
            </Dialog>
            <div className="bg-light text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Quản Lý Đặt Phòng</h6>
                    <button className="btn btn-sm btn-primary" onClick={() => navigate('/admin/add-booking')}>
                        Thêm Đặt Phòng
                    </button>
                </div>
                <p className={`text-${message.type === 'success' ? 'success' : 'danger'}`}>{message.text}</p>

                <div className="table-responsive">
                    <table className="table text-start align-middle table-hover table-striped mb-0">
                        <thead>
                            <tr className="text-dark">
                                <th scope="col">ID</th>
                                <th scope="col">Tên Người Đặt</th>
                                <th scope="col">Phòng</th>
                                <th scope="col">Check-in</th>
                                <th scope="col">Check-out</th>
                                <th scope="col">Tổng Tiền</th>
                                <th scope="col">Thanh Toán</th>
                                <th scope="col">Trạng Thái</th>
                                <th scope="col">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.id}</td>
                                    <td>{booking.bookingName}</td>
                                    <td>
                                        {booking.rooms && booking.rooms.length > 0
                                            ? booking.rooms.map((room, index) => room.roomNumber).join(' & ')
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {parseDate(booking.checkInDate)
                                            ? parseDate(booking.checkInDate).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {parseDate(booking.checkOutDate)
                                            ? parseDate(booking.checkOutDate).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td>{booking.totalAmount}</td>
                                    <td>
                                        <span
                                            className={
                                                booking.status === 'Đã thanh toán'
                                                    ? 'text-success'
                                                    : booking.status === 'Chưa thanh toán'
                                                    ? 'text-danger'
                                                    : booking.status === 'Hoàn tiền'
                                                    ? 'text-primary'
                                                    : ''
                                            }
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={
                                                booking.bookingStatus === 'Hoàn thành'
                                                    ? 'text-success'
                                                    : booking.bookingStatus === 'Đã hủy'
                                                    ? 'text-danger'
                                                    : booking.bookingStatus === 'Yêu cầu hủy'
                                                    ? 'text-danger'
                                                    : booking.bookingStatus === 'Đã đặt'
                                                    ? 'text-success'
                                                    : ''
                                            }
                                        >
                                            {booking.bookingStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {booking.bookingStatus === 'Đã đặt' && (
                                            <>
                                                <a onClick={() => handleFinishBooking(booking.id, booking.status)}>
                                                    <i className="fa-solid fa-circle-check" title="Hoàn thành"></i>
                                                </a>
                                                <a onClick={() => handleCancelBookingAdmin(booking.id)}>
                                                    <i className="fas fa-times" title="Hủy"></i>
                                                </a>
                                            </>
                                        )}
                                        {booking.bookingStatus === 'Yêu cầu hủy' && (
                                            <>
                                                <a onClick={() => handleCancelBooking(booking.id, true)}>
                                                    <i className="fa-solid fa-check " title="Xác nhận hủy"></i>
                                                </a>
                                                <a onClick={() => handleCancelBooking(booking.id, false)}>
                                                    <i className="fas fa-times" title="Hủy yêu cầu hủy"></i>
                                                </a>
                                            </>
                                        )}
                                        {booking.bookingStatus === 'Đã hủy' && (
                                            <a onClick={() => handleDeleteBooking(booking.id, booking.statusBooking)}>
                                                <i className="fa-solid fa-trash-can" title="Xóa"></i>
                                            </a>
                                        )}
                                    </td>
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

export default AdminBooking;
