import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Contact() {
    const [hotel, setHotel] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Thêm trạng thái cho thông báo thành công

    useEffect(() => {
        axios
            .get('http://localhost:8080/hotel/?id=1')
            .then((response) => {
                if (response.data.data && response.data.data.length > 0) {
                    setHotel(response.data.data[0]); // Lấy phần tử đầu tiên
                }
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi gọi API', error);
            });
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        const contactData = {
            name,
            email,
            phoneNumber,
            message,
        };

        axios
            .post('http://localhost:8080/contact/create', contactData)
            .then((response) => {
                console.log('Contact created successfully', response.data);
                setSuccessMessage('Đã gửi liên hệ thành công!'); // Cập nhật thông báo thành công
                // Làm sạch form
                setName('');
                setEmail('');
                setPhoneNumber('');
                setMessage('');
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi gửi dữ liệu', error);
            });
    };

    if (!hotel) {
        return (
            <div id="preloder">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <>
            {/* Contact Section Begin */}
            <section className="contact-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="contact-text">
                                <h2>Thông tin liên lạc</h2>
                                <h3>{hotel.name}</h3>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="c-o">Địa chỉ:</td>
                                            <td>{hotel.address}</td>
                                        </tr>
                                        <tr>
                                            <td className="c-o">SĐT:</td>
                                            <td>{hotel.phoneNumber}</td>
                                        </tr>
                                        <tr>
                                            <td className="c-o">Email:</td>
                                            <td>{hotel.email}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-lg-7 offset-lg-1">
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="row">
                                    <div className="col-lg-4">
                                        <input
                                            type="text"
                                            placeholder="Tên Của Bạn"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{ color: 'black' }} // Thay đổi màu chữ thành đen
                                        />
                                    </div>
                                    <div className="col-lg-4">
                                        <input
                                            type="text"
                                            placeholder="Email Của Bạn"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ color: 'black' }} // Thay đổi màu chữ thành đen
                                        />
                                    </div>
                                    <div className="col-lg-4">
                                        <input
                                            type="text"
                                            placeholder="SĐT Của Bạn"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            style={{ color: 'black' }} // Thay đổi màu chữ thành đen
                                        />
                                    </div>
                                    <div className="col-lg-12">
                                        <textarea
                                            placeholder="Lời Nhắn"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            style={{ color: 'black' }} // Thay đổi màu chữ thành đen
                                        ></textarea>
                                        <button type="submit">Gửi Ngay</button>
                                    </div>
                                </div>
                            </form>
                            {successMessage && <p className="text-success">{successMessage}</p>}{' '}
                            {/* Hiển thị thông báo thành công */}
                        </div>
                    </div>
                    <div className="map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9068984427265!2d105.73544931533124!3d21.036681792841473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0d092a4161%3A0x18fa5e1c7973e7a2!2sHanoi%20University%20of%20Industry!5e0!3m2!1sen!2s!4v1697443415728!5m2!1sen!2s"
                            height="470"
                            style={{ border: 0 }}
                            allowFullScreen=""
                        ></iframe>
                    </div>
                </div>
            </section>
            {/* Contact Section End */}
        </>
    );
}

export default Contact;
