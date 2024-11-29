import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const HotelMultiBooking = () => {
    const [selectedRooms, setSelectedRooms] = useState([]);

    // Mock data cho các phòng khách sạn
    const rooms = [
        {
            id: 1,
            name: 'Phòng Deluxe Gia Đình',
            description: 'Phòng rộng rãi với view thành phố',
            price: 2500000,
            size: '40m²',
            beds: '2 giường đôi',
            maxOccupancy: 4,
            amenities: ['Bữa sáng miễn phí', 'Wifi', 'Hồ bơi', 'Bãi đỗ xe'],
            image: '/api/placeholder/400/250',
        },
        {
            id: 2,
            name: 'Phòng Suite Premium',
            description: 'Phòng sang trọng với ban công riêng',
            price: 3500000,
            size: '55m²',
            beds: '1 giường king',
            maxOccupancy: 3,
            amenities: ['Bữa sáng miễn phí', 'Wifi', 'Hồ bơi', 'Bãi đỗ xe'],
            image: '/api/placeholder/400/250',
        },
        {
            id: 3,
            name: 'Phòng Superior Gia Đình',
            description: 'Phòng tiện nghi với không gian thoáng đãng',
            price: 2800000,
            size: '45m²',
            beds: '2 giường đôi',
            maxOccupancy: 4,
            amenities: ['Bữa sáng miễn phí', 'Wifi', 'Bãi đỗ xe'],
            image: '/api/placeholder/400/250',
        },
    ];

    const handleRoomSelect = (room) => {
        if (selectedRooms.length >= 3) {
            if (selectedRooms.some((r) => r.id === room.id)) {
                setSelectedRooms(selectedRooms.filter((r) => r.id !== room.id));
            } else {
                alert('Bạn chỉ có thể chọn tối đa 3 phòng!');
            }
        } else {
            if (selectedRooms.some((r) => r.id === room.id)) {
                setSelectedRooms(selectedRooms.filter((r) => r.id !== room.id));
            } else {
                setSelectedRooms([...selectedRooms, room]);
            }
        }
    };

    const totalPrice = selectedRooms.reduce((sum, room) => sum + room.price, 0);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Thông tin tìm kiếm và giỏ phòng */}
            <div className="bg-blue-600 text-white p-4 rounded-lg mb-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Kết quả tìm kiếm</h2>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>3 người lớn</div>
                                <div>1 trẻ em</div>
                                <div>Cần đặt: 3 phòng</div>
                            </div>
                        </div>
                        <div className="bg-white text-black p-4 rounded-lg">
                            <div className="text-lg font-bold mb-2">Phòng đã chọn: /3</div>
                            <div className="text-blue-600 font-bold">Tổng tiền:đ/đêm</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách phòng */}
            <div className="max-w-6xl mx-auto space-y-6">
                {rooms.map((room) => {
                    const isSelected = selectedRooms.some((r) => r.id === room.id);

                    return (
                        <Card
                            key={room.id}
                            className={`overflow-hidden hover:shadow-lg transition-all ${
                                isSelected ? 'border-2 border-blue-600' : ''
                            }`}
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Ảnh phòng */}
                                <div className="md:w-1/3 relative">
                                    <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full">
                                            Đã chọn
                                        </div>
                                    )}
                                </div>

                                {/* Thông tin phòng */}
                                <div className="p-6 md:w-2/3">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                                            <div className="text-yellow-400 mb-2">★★★★★</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {room.price.toLocaleString()}đ
                                            </div>
                                            <div className="text-sm text-gray-500">mỗi đêm</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-sm">
                                            <span className="font-medium">Kích thước:</span> {room.size}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Giường:</span> {room.beds}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Số người tối đa:</span> {room.maxOccupancy}{' '}
                                            người
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4">{room.description}</p>

                                    {/* Tiện nghi */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {room.amenities.map((amenity) => (
                                            <span key={amenity} className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleRoomSelect(room)}
                                        className={`w-full md:w-auto px-6 py-2 rounded-md transition-colors ${
                                            isSelected
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {isSelected ? 'Hủy chọn' : 'Chọn phòng này'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Nút xác nhận đặt phòng */}
            {selectedRooms.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div>
                            <div className="text-lg font-bold">Đã chọn {selectedRooms.length} phòng</div>
                            <div className="text-gray-600">Tổng tiền: {totalPrice.toLocaleString()}đ/đêm</div>
                        </div>
                        <button
                            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => alert('Tiến hành thanh toán với ' + selectedRooms.length + ' phòng')}
                        >
                            Đặt {selectedRooms.length} phòng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelMultiBooking;
