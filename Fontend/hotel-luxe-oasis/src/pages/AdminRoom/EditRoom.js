import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditRoom() {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        roomNumber: '',
        price: '',
        description: '',
        bed: '',
        size: '',
        capacity: '',
        view: '',
        hotelId: '',
        categoryId: '',
        file: null,
        currentImageUrl: '',
        discount: '',
        discountedPrice: '',
    });
    const [hotels, setHotels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentImage, setCurrentImage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoom();
        fetchHotels();
        fetchCategories();
    }, [id]);
    const getToken = () => localStorage.getItem('token');

    const fetchRoom = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:8080/admin/room/search?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const room = response.data.data;
            if (room) {
                setFormData({
                    name: room.name,
                    roomNumber: room.roomNumber,
                    price: room.price,
                    description: room.description,
                    bed: room.bed,
                    size: room.size,
                    capacity: room.capacity,
                    view: room.view,
                    hotelId: room.hotels ? room.hotels.id : '',
                    categoryId: room.category ? room.category.id : '',
                    file: null,
                    currentImageUrl: room.roomImg,
                    discount: room.discount || '',
                    discountedPrice: room.discountedPrice || '',
                });

                setCurrentImage(room.roomImg || 'default-image-url');
            }
        } catch (error) {
            console.error('Error fetching room data', error);
        }
    };

    const fetchHotels = async () => {
        try {
            const response = await axios.get('http://localhost:8080/hotel/');
            setHotels(response.data.data);
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
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => {
            const updatedData = { ...prevFormData, [name]: value };

            // Tính toán giá đã giảm
            if (name === 'price' || name === 'discount') {
                const price = parseFloat(updatedData.price) || 0;
                const discount = parseFloat(updatedData.discount) || 0;
                updatedData.discountedPrice = price - price * (discount / 100);
            }

            return updatedData;
        });
    };

    const handleFileChange = (e) => {
        setFormData((prevFormData) => {
            const [file] = e.target.files;
            return {
                ...prevFormData,
                file,
                currentImage: file ? URL.createObjectURL(file) : prevFormData.currentImage,
            };
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
            data.append('hotels.id', formData.hotelId);
        }
        if (formData.categoryId) {
            data.append('category.id', formData.categoryId);
        }
        if (formData.file) {
            data.append('file', formData.file);
        } else {
            data.append('roomImg', formData.currentImageUrl);
        }
        data.append('discount', formData.discount);
        data.append('discountedPrice', formData.discountedPrice);

        try {
            const token = getToken();
            const response = await axios.put(`http://localhost:8080/admin/room/update/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate('/admin/room');
        } catch (error) {
            console.error('Error updating room', error);
        }
    };
    return (
        <div className="container">
            <h2>Edit Room</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Room Number</label>
                    <input
                        type="text"
                        className="form-control"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Discount (%)</label>
                    <input
                        type="number"
                        className="form-control"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min={0}
                        max={100}
                    />
                </div>
                <div className="form-group">
                    <label>Discounted Price</label>
                    <input
                        type="number"
                        className="form-control"
                        name="discountedPrice"
                        value={formData.discountedPrice}
                        readOnly
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Bed</label>
                    <input
                        type="text"
                        className="form-control"
                        name="bed"
                        value={formData.bed}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Size</label>
                    <input
                        type="text"
                        className="form-control"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Capacity</label>
                    <input
                        type="text"
                        className="form-control"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>View</label>
                    <input
                        type="text"
                        className="form-control"
                        name="view"
                        value={formData.view}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Hotel</label>
                    <select className="form-control" name="hotelId" value={formData.hotelId} onChange={handleChange}>
                        {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                                {hotel.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <select
                        className="form-control"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <div className="image-preview">
                        <img
                            src={currentImage || 'default-image-url'} // Cập nhật URL ảnh hiện tại
                            alt="Current"
                            className="img-thumbnail"
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                        />
                    </div>
                    <input type="file" className="form-control" onChange={handleFileChange} />
                </div>
                <button type="submit" className="btn btn-primary">
                    Save
                </button>
            </form>
        </div>
    );
}

export default EditRoom;
