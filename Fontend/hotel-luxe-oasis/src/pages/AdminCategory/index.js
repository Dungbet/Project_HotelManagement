import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function AdminCategory() {
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, [page, size]);
    // Hàm lấy token từ localStorage
    const getToken = () => localStorage.getItem('token');

    const fetchCategories = async () => {
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/admin/roomcategory/', {
                params: { page: page - 1, size },
                headers: { Authorization: `Bearer ${token}` },
            });
            const { data } = response.data; // Destructure directly from response.data
            setCategories(data.data || []); // Adjusted to match the actual structure
            setTotalPages(data.totalPages || 1); // Use the correct field for totalPages
        } catch (error) {
            console.error('Error fetching categories', error);
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
            if (editingCategory) {
                await axios.put(
                    'http://localhost:8080/admin/roomcategory/update',
                    {
                        ...formData,
                        id: editingCategory.id,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                setEditingCategory(null);
            } else {
                await axios.post('http://localhost:8080/admin/roomcategory/create', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setFormData({
                name: '',
                description: '',
            });
            fetchCategories(); // Refresh categories list
        } catch (error) {
            console.error('Error submitting form', error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
        });
    };

    const handleDeleteClick = (id) => {
        setCategoryToDelete(id);
        setDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await axios.delete('http://localhost:8080/admin/roomcategory/', {
                params: { id: categoryToDelete },
                headers: { Authorization: `Bearer ${token}` },
            });
            setDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Danh Mục Phòng</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            Tên
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            Mô tả
                        </label>
                        <textarea
                            className="form-control"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {editingCategory ? 'Cập Nhật' : 'Thêm'}
                    </button>
                    {editingCategory && (
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => {
                                setEditingCategory(null);
                                setFormData({ name: '', description: '' });
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
                            <th>Tên</th>
                            <th>Mô tả</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td>{category.name}</td>
                                    <td>{category.description}</td>

                                    <td>
                                        <a onClick={() => handleEdit(category)}>
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a onClick={() => handleDeleteClick(category.id)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    Không có dữ liệu danh mục
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
                        Bạn có chắc chắn muốn xóa danh mục này không?
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

export default AdminCategory;
