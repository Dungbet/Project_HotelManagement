import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function AdminContact() {
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState({
        deleteMessageSuccess: '',
        deleteMessageFail: '',
    });
    const [page, setPage] = useState(0); // Current page
    const [size, setSize] = useState(10); // Number of contacts per page
    const [endPage, setEndPage] = useState(1); // Total number of pages
    const [dialogOpen, setDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        fetchContacts();
    }, [page, size]);

    const fetchContacts = async () => {
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/admin/contact/', {
                params: { page, size },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { data } = response.data; // Extract data from response.data
            setContacts(data.data || []); // Adjust to extract contacts from the correct path
            setEndPage(data.totalPages || 1); // Correctly set total pages
        } catch (error) {
            console.error('Error fetching contacts', error);
        }
    };

    const handleDeleteClick = (id) => {
        setContactToDelete(id);
        setDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        try {
            const token = getToken();
            await axios.delete('http://localhost:8080/admin/coupon/', {
                params: { id: contactToDelete },
                headers: { Authorization: `Bearer ${token}` },
        });
            setDialogOpen(false);
            setContactToDelete(null);
            fetchContacts();
            setMessages({ ...messages, deleteMessageSuccess: 'Xóa liên hệ thành công' });
        } catch (error) {
            setMessages({ ...messages, deleteMessageFail: 'Xóa liên hệ thất bại' });
            console.error('Error deleting category', error);
        }
    };

    // const handleDelete = async (id) => {
    //     if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
    //         try {
    //             const token = getToken();
    //             await axios.delete('http://localhost:8080/admin/contact/', {
    //                 params: { id },
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //             setMessages({ ...messages, deleteMessageSuccess: 'Xóa liên hệ thành công' });
    //             setContacts(contacts.filter((contact) => contact.id !== id));
    //         } catch (error) {
    //             setMessages({ ...messages, deleteMessageFail: 'Xóa liên hệ thất bại' });
    //             console.error('Error deleting contact', error);
    //         }
    //     }
    // };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Danh Sách Liên Hệ</h6>
                </div>
                <p className="text-success">{messages.deleteMessageSuccess}</p>
                <p className="text-danger">{messages.deleteMessageFail}</p>
                <table className="table text-start align-middle table-hover table-striped mb-0">
                    <thead>
                        <tr className="text-dark">
                            <th scope="col">ID</th>
                            <th scope="col">Tên</th>
                            <th scope="col">Email</th>
                            <th scope="col">Điện thoại</th>
                            <th scope="col">Lời nhắn</th>
                            <th scope="col">Ngày tạo</th>

                            <th scope="col">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td>{contact.id}</td>
                                    <td>{contact.name}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.phoneNumber}</td>
                                    <td>{contact.message}</td>
                                    <td>{contact.createAt}</td>
                                    <td>
                                        <a onClick={() => handleDeleteClick(contact.id)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Không có dữ liệu liên hệ
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="d-flex justify-content-center">
                    <nav aria-label="Page navigation">
                        <ul className="pagination">
                            <li className="page-item">
                                <button
                                    className="page-link"
                                    onClick={() => setPage(0)}
                                    disabled={page === 0}
                                    aria-label="Previous"
                                >
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
                                    disabled={page === endPage - 1}
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

export default AdminContact;
