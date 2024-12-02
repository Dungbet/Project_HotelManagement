import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
function AdminCoupon() {
    const [coupons, setCoupons] = useState([]);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        expiryDate: '',
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons();
        setMinExpiryDate(); // Set min expiry date on component mount
    }, [page, size]);
    const getToken = () => localStorage.getItem('token');
    const fetchCoupons = async () => {
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/admin/coupon/', {
                params: { page: page - 1, size },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { data } = response.data; // Destructure directly from response.data
            setCoupons(data.data || []); // Adjusted to match the actual structure
            setTotalPages(data.totalPages || 1); // Use the correct field for totalPages
        } catch (error) {
            console.error('Error fetching coupons', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const formattedDate = new Date(formData.expiryDate)
                .toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
                .replace(',', '');

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            if (editingCoupon) {
                await axios.put(
                    'http://localhost:8080/admin/coupon/update',
                    {
                        ...formData,
                        expiryDate: formattedDate,
                        id: editingCoupon.id,
                    },
                    { headers },
                );
                setEditingCoupon(null);
            } else {
                await axios.post(
                    'http://localhost:8080/admin/coupon/create',
                    {
                        ...formData,
                        expiryDate: formattedDate,
                    },
                    { headers },
                );
            }
            setFormData({
                code: '',
                discountPercentage: '',
                expiryDate: '',
            });
            fetchCoupons(); // Refresh coupons list
        } catch (error) {
            console.error('Error submitting form', error);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);

        // Xử lý ngày hết hạn để định dạng thành YYYY-MM-DDTHH:MM
        let formattedDate = '';
        if (coupon.expiryDate) {
            // Giả sử ngày hết hạn được cung cấp dưới dạng "dd/MM/yyyy HH:mm"
            const [day, month, year, hour, minute] = coupon.expiryDate.split(/[\s/:]/);
            formattedDate = `${year}-${month}-${day}T${hour}:${minute}`;
        }

        setFormData({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            expiryDate: formattedDate,
        });
    };

    const handleDeleteClick = (id) => {
        setCouponToDelete(id);
        setDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await axios.delete('http://localhost:8080/admin/coupon/', {
                params: { id: couponToDelete },
                headers: { Authorization: `Bearer ${token}` },
            });
            setDialogOpen(false);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting category', error);
        }
    };

    // const handleDelete = async (id) => {
    //     if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
    //         try {
    //             const token = getToken();
    //             await axios.delete('http://localhost:8080/admin/coupon/', {
    //                 params: { id },
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //             fetchCoupons(); // Refresh coupons list
    //         } catch (error) {
    //             console.error('Error deleting coupon', error);
    //         }
    //     }
    // };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const parseDateString = (dateString) => {
        if (!dateString) return null;
        // Định dạng ngày theo định dạng "dd/MM/yyyy HH:mm"
        const [day, month, year, hour, minute] = dateString.split(/[\s/:]/);
        return new Date(`${year}-${month}-${day}T${hour}:${minute}`);
    };

    const setMinExpiryDate = () => {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
        document.getElementById('expiryDate').setAttribute('min', formattedDate);
    };

    const getExpiryDateColor = (expiryDate) => {
        const now = new Date();
        const date = parseDateString(expiryDate);
        if (date) {
            return date < now ? 'text-danger' : 'text-success'; // 'text-danger' for past dates, 'text-success' for future dates
        }
        return '';
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Quản Lý Mã Giảm Giá</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="code" className="form-label">
                            Mã
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discountPercentage" className="form-label">
                            Giảm giá (%)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="discountPercentage"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            required
                            min="0" // Set minimum value to 0
                            max="100" // Set maximum value to 100
                        />
                    </div>
                    <input
                        type="datetime-local"
                        className="form-control"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate} // Đảm bảo giá trị là định dạng YYYY-MM-DDTHH:MM
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="btn btn-primary">
                        {editingCoupon ? 'Cập Nhật' : 'Thêm'}
                    </button>
                    {editingCoupon && (
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => {
                                setEditingCoupon(null);
                                setFormData({ code: '', discountPercentage: '', expiryDate: '' });
                            }}
                        >
                            Hủy
                        </button>
                    )}
                </form>
                <table className="table mt-4">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Mã</th>
                            <th>Giảm giá (%)</th>
                            <th>Ngày hết hạn</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length > 0 ? (
                            coupons.map((coupon) => (
                                <tr key={coupon.id}>
                                    <td>{coupon.id}</td>
                                    <td>{coupon.code}</td>
                                    <td>{coupon.discountPercentage}</td>
                                    <td className={getExpiryDateColor(coupon.expiryDate)}>
                                        {coupon.expiryDate
                                            ? parseDateString(coupon.expiryDate)?.toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        <a onClick={() => handleEdit(coupon)}>
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a onClick={() => handleDeleteClick(coupon.id)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Không có dữ liệu mã giảm giá
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="d-flex justify-content-center mt-4">
                    <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            <li className="page-item">
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    aria-label="Previous"
                                >
                                    <span aria-hidden="true">&laquo;</span>
                                    <span className="sr-only">Previous</span>
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
                                <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(i)}>
                                        {i}
                                    </button>
                                </li>
                            ))}
                            <li className="page-item">
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
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
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa mã giảm giá này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AdminCoupon;
