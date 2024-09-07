import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function AddRoom() {
    const [hotels, setHotels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        roomNumber: '',
        price: '',
        description: '',
        bed: '',
        size: '',
        capacity: '',
        view: '',
        hotelId: '', // ID của khách sạn
        categoryId: '', // ID của loại phòng
        file: null,
        discount: '',
        discountedPrice: '',
    });
    const [previewImage, setPreviewImage] = useState(''); // Thêm state để lưu URL ảnh xem trước

    const navigate = useNavigate();
    // Hàm lấy token từ localStorage
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await axios.get('http://localhost:8080/hotel/');
                if (Array.isArray(response.data.data)) {
                    setHotels(response.data.data);
                } else {
                    console.error('API did not return an array for hotels', response.data);
                }
            } catch (error) {
                console.error('Error fetching hotels', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const token = getToken();
                const response = await axios.get('http://localhost:8080/admin/roomcategory/get-all', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (Array.isArray(response.data.data)) {
                    setCategories(response.data.data);
                } else {
                    console.error('API did not return an array for categories', response.data);
                }
            } catch (error) {
                console.error('Error fetching categories', error);
            }
        };

        fetchHotels();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prevState) => {
            const updatedData = { ...prevState, [name]: type === 'file' ? files[0] : value };

            // Tính toán giá đã giảm
            if (name === 'price' || name === 'discount') {
                const price = parseFloat(updatedData.price) || 0;
                const discount = parseFloat(updatedData.discount) || 0;
                updatedData.discountedPrice = price - price * (discount / 100);
            }

            // Cập nhật hình ảnh xem trước nếu là trường file
            if (type === 'file' && files[0]) {
                setPreviewImage(URL.createObjectURL(files[0]));
            }

            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('roomNumber', formData.roomNumber);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('bed', formData.bed);
        data.append('size', formData.size);
        data.append('capacity', formData.capacity);
        data.append('view', formData.view);
        if (formData.hotelId) {
            data.append('hotels.id', formData.hotelId); // Sử dụng 'hotels.id'
        }
        if (formData.categoryId) {
            data.append('category.id', formData.categoryId); // Sử dụng 'category.id'
        }
        if (formData.file) {
            data.append('file', formData.file);
        }
        data.append('discount', formData.discount);
        data.append('discountedPrice', formData.discountedPrice);

        try {
            const token = getToken();
            const response = await axios.post('http://localhost:8080/admin/room/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Room added successfully:', response.data);
            navigate('/admin/room');
        } catch (error) {
            console.error('Error adding room:', error);
        }
    };

    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded p-4">
                <h6 className="mb-4">Thêm Phòng</h6>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            Tên phòng
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
                        <label htmlFor="roomNumber" className="form-label">
                            Số phòng
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="roomNumber"
                            name="roomNumber"
                            value={formData.roomNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="price" className="form-label">
                            Giá
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discount" className="form-label">
                            Giảm giá (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="discount"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            min={0}
                            max={100}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discountedPrice" className="form-label">
                            Giá đã giảm
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="discountedPrice"
                            name="discountedPrice"
                            value={formData.discountedPrice}
                            readOnly
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
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="bed" className="form-label">
                            Giường (cái)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="bed"
                            name="bed"
                            value={formData.bed}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="size" className="form-label">
                            Diện tích (m²)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="size"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="capacity" className="form-label">
                            Sức chứa (người)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="view" className="form-label">
                            View
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="view"
                            name="view"
                            value={formData.view}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="hotelId" className="form-label">
                            Khách sạn
                        </label>
                        <select
                            className="form-control"
                            id="hotelId"
                            name="hotelId"
                            value={formData.hotelId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn khách sạn</option>
                            {hotels.map((hotel) => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="categoryId" className="form-label">
                            Loại phòng
                        </label>
                        <select
                            className="form-control"
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn loại phòng</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="file" className="form-label">
                            Ảnh phòng
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            id="file"
                            name="file"
                            accept="image/*"
                            onChange={handleChange}
                        />
                        {previewImage && (
                            <div className="mt-2">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                                />
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Thêm phòng
                    </button>
                </form>
                <Link to="/admin/room" className="btn btn-secondary mt-3">
                    Quay lại
                </Link>
            </div>
        </div>
    );
}

export default AddRoom;
