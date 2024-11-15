import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import vi from 'date-fns/locale/vi';
import { Link, useNavigate } from 'react-router-dom';
function Home() {
    const heroSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    const testimonialSliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };
    const [rooms, setRooms] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('http://localhost:8080/room/get-room-random')
            .then((response) => {
                setRooms(response.data.data);
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi gọi API', error);
            });
    }, []);

    useEffect(() => {
        axios
            .get('http://localhost:8080/review/get-review-good')
            .then((response) => {
                console.log(response.data); // Kiểm tra dữ liệu nhận được
                setReviews(response.data.data); // Lưu trữ dữ liệu vào state
            })
            .catch((error) => {
                console.error('Có lỗi xảy ra khi gọi API', error);
            });
    }, []);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (endDate && date >= endDate) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };
    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleCheckRooms = () => {
        if (!startDate || !endDate) {
            setError('Vui lòng chọn cả ngày đến và ngày đi.'); // Hiển thị thông báo lỗi nếu không chọn đủ ngày
            return;
        }
        setError(''); // Xóa thông báo lỗi nếu chọn đủ ngày
        navigate(
            `/rooms-available?checkinDate=${formatDate(startDate)}&checkoutDate=${formatDate(
                endDate,
            )}&sortedField=price&keyword=`,
        );
    };
    // if (rooms.length === 0) {
    //     return (
    //         <div id="preloder">
    //             <div className="loader"></div>
    //         </div>
    //     );
    // }

    return (
        <>
            {/* Hero Section Begin */}
            <section className="hero-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="hero-text">
                                <h1>Hotel Luxe Oasis</h1>
                                <p>
                                    Dưới đây là các trang web đặt phòng khách sạn tốt nhất, bao gồm các đề xuất về du
                                    lịch quốc tế và tìm phòng khách sạn giá rẻ.
                                </p>
                                <Link to="/rooms" className="primary-btn">
                                    Khám Phá Ngay
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-5 offset-xl-2 offset-lg-1">
                            <div className="booking-form">
                                <h3>Đặt Phòng</h3>
                                <form action="#">
                                    <div className="check-date">
                                        <label htmlFor="date-in">Ngày đến:</label>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={handleStartDateChange}
                                            minDate={new Date()}
                                            dateFormat="dd/MM/yyyy"
                                            className="date-input"
                                            placeholderText="Chọn ngày đến"
                                            id="date-in"
                                            locale={vi}
                                        />
                                        <i className="icon_calendar"></i>
                                    </div>
                                    <div className="check-date">
                                        <label htmlFor="date-out">Ngày đi:</label>
                                        <DatePicker
                                            selected={endDate}
                                            onChange={handleEndDateChange}
                                            minDate={
                                                startDate
                                                    ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
                                                    : new Date()
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            className="date-input"
                                            placeholderText="Chọn ngày đi"
                                            id="date-out"
                                            locale={vi}
                                        />
                                        <i className="icon_calendar"></i>
                                    </div>
                                    <div class="select-option">
                                        <label for="guest">Số người:</label>
                                        <select id="guest">
                                            <option value="">2 Người</option>
                                            <option value="">3 Người</option>
                                        </select>
                                    </div>
                                    <div class="select-option">
                                        <label for="room">Số phòng:</label>
                                        <select id="room">
                                            <option value="">1 Phòng</option>
                                            <option value="">2 Phòng</option>
                                        </select>
                                    </div>
                                    {error && <p className="error-message">{error}</p>}{' '}
                                    {/* Hiển thị thông báo lỗi nếu có */}
                                    <button
                                        type="button"
                                        onClick={handleCheckRooms}
                                        className="button-check-room primary-btn"
                                    >
                                        Kiểm tra phòng
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Slider {...heroSliderSettings} className="hero-slider">
                    <div className="hs-item">
                        <img
                            src="img/hero/hero-1.jpg"
                            alt="Hero Image 1"
                            style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="hs-item">
                        <img
                            src="img/hero/hero-2.jpg"
                            alt="Hero Image 2"
                            style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="hs-item">
                        <img
                            src="img/hero/hero-3.jpg"
                            alt="Hero Image 3"
                            style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
                        />
                    </div>
                </Slider>
            </section>
            {/* Hero Section End */}

            {/* About Us Section Begin */}
            <section className="aboutus-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="about-text">
                                <div className="section-title">
                                    <span>VỀ CHÚNG TÔI</span>
                                    <h2>Khách sạn Luxe Oasis</h2>
                                </div>
                                <p className="f-para">
                                    luxeoasis.com là trang web cung cấp chỗ ở trực tuyến hàng đầu. Chúng tôi đam mê du
                                    lịch. Mỗi ngày, chúng tôi truyền cảm hứng và tiếp cận hàng triệu khách du lịch trên
                                    90 trang web địa phương bằng 41 ngôn ngữ.
                                </p>
                                <p className="s-para">
                                    Vì vậy, khi cần đặt phòng khách sạn, nhà nghỉ cho thuê, khu nghỉ dưỡng, căn hộ, nhà
                                    khách hoặc nhà trên cây hoàn hảo, chúng tôi sẽ hỗ trợ bạn.
                                </p>
                                <a href="#" className="primary-btn about-btn">
                                    Đọc thêm
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-pic">
                                <div className="row">
                                    <div className="col-sm-6">
                                        <img src="img/about/about-1.jpg" alt="" />
                                    </div>
                                    <div className="col-sm-6">
                                        <img src="img/about/about-2.jpg" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* About Us Section End */}

            {/* Services Section End */}
            <section className="services-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>CHÚNG TA LÀM GÌ</span>
                                <h2>Khám phá dịch vụ của chúng tôi</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 col-sm-6">
                            <div className="service-item">
                                <i className="flaticon-036-parking"></i>
                                <h4>Kế hoạch du lịch</h4>
                                <p>
                                    Điều quan trọng là phải chăm sóc bệnh nhân và bệnh nhân sẽ được theo dõi, nhưng đồng
                                    thời chúng sẽ xảy ra do nỗ lực và đau đớn rất nhiều.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="service-item">
                                <i className="flaticon-033-dinner"></i>
                                <h4>Dịch vụ ăn uống</h4>
                                <p>
                                    Điều quan trọng là phải chăm sóc bệnh nhân và bệnh nhân sẽ được theo dõi, nhưng đồng
                                    thời chúng sẽ xảy ra do nỗ lực và đau đớn rất nhiều.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="service-item">
                                <i className="flaticon-026-bed"></i>
                                <h4>Trông trẻ</h4>
                                <p>
                                    Điều quan trọng là phải chăm sóc bệnh nhân và bệnh nhân sẽ được theo dõi, nhưng đồng
                                    thời chúng sẽ xảy ra do nỗ lực và đau đớn rất nhiều.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="service-item">
                                <i className="flaticon-024-towel"></i>
                                <h4>Giặt là</h4>
                                <p>
                                    Điều quan trọng là phải chăm sóc bệnh nhân và bệnh nhân sẽ được theo dõi, nhưng đồng
                                    thời chúng sẽ xảy ra do nỗ lực và đau đớn rất nhiều.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="service-item">
                                <i className="flaticon-044-clock-1"></i>
                                <h4>Thuê tài xế</h4>
                                <p>
                                    Điều quan trọng là phải chăm sóc bệnh nhân và bệnh nhân sẽ được theo dõi, nhưng đồng
                                    thời chúng sẽ xảy ra do nỗ lực và đau đớn rất nhiều.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="service-item">
                                <i className="flaticon-012-cocktail"></i>
                                <h4>Quầy bar & đồ uống</h4>
                                <p>
                                    Điều quan trọng là phải chăm sóc bệnh nhân và bệnh nhân sẽ được theo dõi, nhưng đồng
                                    thời chúng sẽ xảy ra do nỗ lực và đau đớn rất nhiều.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Services Section End */}

            {/* Home Room Section Begin */}
            <section className="hp-room-section">
                <div className="container-fluid">
                    <div className="hp-room-items">
                        <div className="row">
                            {rooms.map((room) => {
                                const discountedPrice = room.discountedPrice.toFixed(1);
                                const formattedPrice = room.price.toLocaleString('vi-VN');
                                const formattedDiscountedPrice = discountedPrice.toLocaleString('vi-VN');
                                return (
                                    <div className="col-lg-3 col-md-6">
                                        <div
                                            className="hp-room-item"
                                            style={{ backgroundImage: `url(${room.roomImg})` }}
                                        >
                                            {room.discount > 0 && (
                                                <div className="discount-tag">Giảm giá {room.discount}%</div>
                                            )}
                                            <div className="hr-text">
                                                <h3>{room.name}</h3>
                                                <h2>
                                                    {room.discount > 0 ? (
                                                        <>
                                                            {/* Hiển thị giá bị gạch */}
                                                            <span
                                                                style={{
                                                                    textDecoration: 'line-through',
                                                                    color: '#888',
                                                                    fontSize: '20px',
                                                                }}
                                                            >
                                                                {formattedDiscountedPrice} VNĐ
                                                            </span>
                                                            <br />
                                                            {/* Hiển thị giá giảm ở dưới */}
                                                            {discountedPrice} VNĐ
                                                            <span>/Mỗi đêm</span>
                                                        </>
                                                    ) : (
                                                        // Chỉ hiển thị giá gốc nếu không có giảm giá
                                                        `${formattedPrice} VNĐ`
                                                    )}
                                                </h2>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td className="r-o">Kích cỡ:</td>
                                                            <td>{room.size} m²</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="r-o">Dung tích:</td>
                                                            <td>Tối đa {room.capacity} người + 1 trẻ nhỏ</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="r-o">Giường:</td>
                                                            <td>{room.bed} giường</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="r-o">View:</td>
                                                            <td>{room.view}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <Link to={`/room-detail/${room.id}`} className="primary-btn">
                                                    Xem thêm
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            {/* Home Room Section End */}

            {/* Testimonial Section Begin */}
            <section className="testimonial-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>LỜI CHỨNG THỰC</span>
                                <h2>Khách hàng nói gì?</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-8 offset-lg-2">
                            {reviews.length === 0 ? (
                                <p>Chưa có đánh giá nào.</p>
                            ) : (
                                <Slider {...testimonialSliderSettings} className="testimonial-slider">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="ts-item">
                                            <p>{review.comment}</p>
                                            <div className="ti-author">
                                                <div className="rating">
                                                    {Array.from({ length: 5 }, (_, index) => (
                                                        <i
                                                            key={index}
                                                            className={
                                                                index < review.rating ? 'icon_star' : 'icon_star-empty'
                                                            }
                                                        ></i>
                                                    ))}
                                                </div>
                                                <h5>- {review.booking.user.name || 'Anonymous'}</h5>
                                            </div>
                                            {review.booking.user.avatar && (
                                                <img
                                                    src={review.booking.user.avatar}
                                                    alt="User Avatar"
                                                    style={{ width: '50px', borderRadius: '50%', margin: '0 auto' }}
                                                    // style={{ width: 'auto', margin: '0 auto' }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </Slider>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* Testimonial Section End */}
        </>
    );
}

export default Home;
