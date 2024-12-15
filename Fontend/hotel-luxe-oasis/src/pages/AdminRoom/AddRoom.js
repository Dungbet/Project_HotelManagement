import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AddRoom() {
    const [hotels, setHotels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

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
        additionalFiles: [],
    });
    const [previewImage, setPreviewImage] = useState(''); // Thêm state để lưu URL ảnh xem trước
    const [previewImages, setPreviewImages] = useState([]); // Xem trước danh sách ảnh
    const [role, setRole] = useState(null);

    const navigate = useNavigate();
    // Hàm lấy token từ localStorage
    const getToken = () => localStorage.getItem('token');
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tên phòng không được để trống.';
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Số phòng không được để trống.';
        if (!formData.price) newErrors.price = 'Giá phòng không được để trống.';
        if (formData.price <= 0) newErrors.price = 'Giá phòng phải lớn hơn 0.';
        if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống.';
        if (!formData.bed) newErrors.bed = 'Số lượng giường không được để trống.';
        if (!formData.size) newErrors.size = 'Diện tích không được để trống.';
        if (!formData.capacity) newErrors.capacity = 'Sức chứa không được để trống.';
        if (formData.capacity <= 0) newErrors.capacity = 'Sức chứa phải lớn hơn 0.';
        if (formData.discount <= 0) newErrors.discount = 'Vui lòng nhập discount (%)';
        if (!formData.view.trim()) newErrors.view = 'View không được để trống.';
        if (!formData.hotelId) newErrors.hotelId = 'Hãy chọn khách sạn.';
        if (!formData.categoryId) newErrors.categoryId = 'Hãy chọn loại phòng.';
        if (!formData.file) newErrors.file = 'Hãy chọn một ảnh thumnail.';
        if (!formData.additionalFiles || formData.additionalFiles.length === 0) {
            newErrors.additionalFiles = 'Hãy chọn ít nhất một ảnh phòng.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
        decodeToken();
    }, []);
    // Giải mã token để lấy role
    const decodeToken = () => {
        const token = getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);

                setRole(decoded.role); // Lấy giá trị 'sub' từ payload
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    };

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
        if (!validateForm()) {
            return;
        }
        console.log('Submitting form with data:', formData); // Thêm log ở đây

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
            data.append('hotels.id', formData.hotelId);
        }
        if (formData.categoryId) {
            data.append('category.id', formData.categoryId);
        }
        if (formData.file) {
            data.append('file', formData.file);
        }
        // Thêm phần xử lý additionalFiles
        if (formData.additionalFiles && formData.additionalFiles.length > 0) {
            formData.additionalFiles.forEach((file, index) => {
                data.append(`additionalFiles`, file);
            });
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

            if (role === 'admin') {
                navigate('/admin/room');
            } else if (role === 'manager') {
                navigate('/manager/room');
            } else {
                navigate('/login'); // Default fallback
            }
        } catch (error) {
            console.error('Error adding room:', error);
        }
    };
    const handleAdditionalFiles = (e) => {
        const files = Array.from(e.target.files).filter((file) => file instanceof File);

        // Thêm các tệp mới vào mảng ảnh xem trước
        setPreviewImages((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);

        // Cập nhật formData với các tệp ảnh mới
        setFormData((prevState) => ({
            ...prevState,
            additionalFiles: [...prevState.additionalFiles, ...files],
        }));
    };

    const handleRemoveFile = (index) => {
        setPreviewImages((prev) => {
            URL.revokeObjectURL(prev[index]); // Xóa URL đã tạo
            return prev.filter((_, i) => i !== index);
        });
        setFormData((prev) => ({
            ...prev,
            additionalFiles: prev.additionalFiles.filter((_, i) => i !== index),
        }));
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
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="roomNumber" className="form-label">
                            Số phòng
                        </label>
                        <input
                            type="text"
                            className={`form-control ${errors.roomNumber ? 'is-invalid' : ''}`}
                            id="roomNumber"
                            name="roomNumber"
                            value={formData.roomNumber}
                            onChange={handleChange}
                        />
                        {errors.roomNumber && <div className="invalid-feedback">{errors.roomNumber}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="price" className="form-label">
                            Giá
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                        />
                        {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discount" className="form-label">
                            Giảm giá (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.discount ? 'is-invalid' : ''}`}
                            id="discount"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            min={0}
                            max={100}
                        />
                        {errors.discount && <div className="invalid-feedback">{errors.discount}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discountedPrice" className="form-label">
                            Giá đã giảm
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.discountedPrice ? 'is-invalid' : ''}`}
                            id="discountedPrice"
                            name="discountedPrice"
                            value={formData.discountedPrice}
                            readOnly
                        />
                        {errors.discountedPrice && <div className="invalid-feedback">{errors.discountedPrice}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            Mô tả
                        </label>
                        <textarea
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                        {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="bed" className="form-label">
                            Giường (cái)
                        </label>
                        <input
                            type="number"
                            className={`form-control ${errors.bed ? 'is-invalid' : ''}`}
                            id="bed"
                            name="bed"
                            value={formData.bed}
                            onChange={handleChange}
                        />
                        {errors.bed && <div className="invalid-feedback">{errors.bed}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="size" className="form-label">
                            Diện tích (m²)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className={`form-control ${errors.size ? 'is-invalid' : ''}`}
                            id="size"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                        />
                        {errors.size && <div className="invalid-feedback">{errors.size}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="capacity" className="form-label">
                            Sức chứa (người)
                        </label>
                        <input
                            type="number"
                            className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                        />
                        {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="view" className="form-label">
                            View
                        </label>
                        <input
                            type="text"
                            className={`form-control ${errors.view ? 'is-invalid' : ''}`}
                            id="view"
                            name="view"
                            value={formData.view}
                            onChange={handleChange}
                        />
                        {errors.view && <div className="invalid-feedback">{errors.view}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="hotelId" className="form-label">
                            Khách sạn
                        </label>
                        <select
                            className={`form-control ${errors.hotelId ? 'is-invalid' : ''}`}
                            id="hotelId"
                            name="hotelId"
                            value={formData.hotelId}
                            onChange={handleChange}
                        >
                            <option value="">Chọn khách sạn</option>
                            {hotels.map((hotel) => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}
                        </select>
                        {errors.hotelId && <div className="invalid-feedback">{errors.hotelId}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="categoryId" className="form-label">
                            Loại phòng
                        </label>
                        <select
                            className={`form-control ${errors.categoryId ? 'is-invalid' : ''}`}
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                        >
                            <option value="">Chọn loại phòng</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="file" className="form-label">
                            Ảnh phòng
                        </label>
                        <input
                            type="file"
                            className={`form-control ${errors.file ? 'is-invalid' : ''}`}
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
                        {errors.file && <div className="invalid-feedback">{errors.file}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="additionalFiles" className="form-label">
                            Ảnh thêm
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            id="additionalFiles"
                            name="additionalFiles"
                            onChange={handleAdditionalFiles}
                            accept="image/*"
                            multiple
                        />
                        {errors.additionalFiles && <div className="invalid-feedback">{errors.additionalFiles}</div>}
                        <div className="mt-2">
                            {previewImages.length > 0 && (
                                <div className="preview-images">
                                    {previewImages.map((image, index) => (
                                        <div key={index} className="preview-image">
                                            <img
                                                src={image}
                                                alt={`Preview ${index}`}
                                                className="img-thumbnail"
                                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                                            />

                                            <button type="button" onClick={() => handleRemoveFile(index)}>
                                                Xóa
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* {previewImages && (
                        <div className="mt-2">
                            <img src={previewImages} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        </div>
                    )} */}
                    {errors.file && <div className="invalid-feedback">{errors.file}</div>}
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
