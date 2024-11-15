import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminUser() {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState({
        addMessageSuccess: '',
        addMessageFail: '',
        updateMessageSuccess: '',
        updateMessageFail: '',
        deteleMessageSuccess: '',
        deteleMessageFail: '',
    });
    const [roles, setRoles] = useState([]);
    const [endPage, setEndPage] = useState(1);
    const [page, setPage] = useState(0); // Current page
    const size = 10; // Number of users per page
    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [page]);

    const fetchUsers = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/admin/user/?page=${page}&size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.data.data);
            setEndPage(response.data.data.totalPages);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/admin/role/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }); // Adjust this to your actual endpoint
            // Ensure the roles data is an array
            setRoles(response.data.data);
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm('Bạn có đồng ý xóa người dùng này?')) {
            try {
                const token = getToken();
                await axios.delete(`http://localhost:8080/admin/user/?id=${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages({ ...messages, deteleMessageSuccess: 'Xóa người dùng thành công' });
                fetchUsers();
            } catch (error) {
                setMessages({ ...messages, deteleMessageFail: 'Xóa người dùng thất bại' });
                console.error('Error deleting user', error);
            }
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            const token = getToken();
            await axios.put('http://localhost:8080/admin/user/update-role', null, {
                params: { roleId: newRoleId, userId },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages({ ...messages, updateMessageSuccess: 'Cập nhật quyền thành công' });
            fetchUsers();
        } catch (error) {
            setMessages({ ...messages, updateMessageFail: 'Cập nhật quyền thất bại' });
            console.error('Error updating role', error);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const token = getToken();
            const userEnable = newStatus === 'active'; // Đúng hơn là so sánh với 'active'
            await axios.put('http://localhost:8080/admin/user/update-enable', null, {
                params: { userEnable, userId },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages({ ...messages, updateMessageSuccess: 'Cập nhật trạng thái thành công' });
            fetchUsers();
        } catch (error) {
            setMessages({ ...messages, updateMessageFail: 'Cập nhật trạng thái thất bại' });
            console.error('Error updating status', error);
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light text-center rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Quản Lý Người Dùng</h6>
                    <button className="btn btn-sm btn-primary" onClick={() => navigate('/admin/add-user')}>
                        Thêm Người Dùng
                    </button>
                </div>
                <p className="text-success">{messages.addMessageSuccess}</p>
                <p className="text-danger">{messages.addMessageFail}</p>
                <p className="text-success">{messages.updateMessageSuccess}</p>
                <p className="text-danger">{messages.updateMessageFail}</p>
                <p className="text-success">{messages.deteleMessageSuccess}</p>
                <p className="text-danger">{messages.deteleMessageFail}</p>
                <div className="table-responsive">
                    <table className="table text-start align-middle table-hover table-striped mb-0">
                        <thead>
                            <tr className="text-dark">
                                <th scope="col">ID</th>
                                <th scope="col">Ảnh</th>

                                <th scope="col">Tên tài khoản</th>
                                <th scope="col">Email</th>

                                <th scope="col">Quyền</th>
                                <th scope="col">Trạng Thái</th>
                                <th scope="col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar} // URL của ảnh
                                                alt="Avatar"
                                                style={{ width: '50px', height: '50px', borderRadius: '50%' }} // Style ảnh
                                            />
                                        ) : (
                                            'Không có ảnh'
                                        )}
                                    </td>

                                    <td>{user.username}</td>
                                    <td>{user.email}</td>

                                    <td>
                                        <select
                                            className="form-select"
                                            aria-label="Default select example"
                                            value={user.role ? user.role.id : ''}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            {Array.isArray(roles) &&
                                                roles.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                                                    </option>
                                                ))}
                                        </select>
                                    </td>

                                    <td>
                                        <select
                                            className="form-select"
                                            aria-label="Default select example"
                                            value={user.enable ? 'active' : 'disable'}
                                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                        >
                                            <option value="active">Kích hoạt</option>
                                            <option value="disable">Vô hiệu hóa</option>
                                        </select>
                                    </td>

                                    <td>
                                        <a onClick={() => deleteUser(user.id)}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </a>
                                        {/* <a>
                                            <i class="fa-regular fa-eye"></i>
                                        </a>
                                        <a>
                                            <i class="fa-regular fa-pen-to-square"></i>
                                        </a> */}
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

export default AdminUser;
