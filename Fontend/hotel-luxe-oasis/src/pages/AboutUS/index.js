import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function AboutUS() {
    useEffect(() => {
        const elements = document.querySelectorAll('[data-setbg]');
        elements.forEach((element) => {
            const bg = element.getAttribute('data-setbg');
            element.style.backgroundImage = `url(${bg})`;
        });
    }, []);

    return (
        <>
            {/* Breadcrumb Section Begin */}
            <div className="breadcrumb-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="breadcrumb-text">
                                <h2>Về Chúng Tôi</h2>
                                <div className="bt-option">
                                    <Link to="/">Trang Chủ</Link>
                                    <span>Về Chúng Tôi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}

            {/* About Us Page Section Begin */}
            <section className="aboutus-page-section spad">
                <div className="container">
                    <div className="about-page-text">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="ap-title">
                                    <h2>Chào mừng đến với Luxe Oasis.</h2>
                                    <p>
                                        Được xây dựng vào năm 2003, khách sạn này nằm ở trung tâm Hà Nội, dễ dàng di
                                        chuyển đến các điểm tham quan du lịch của thành phố. Khách sạn cung cấp các
                                        phòng được trang trí trang nhã.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-5 offset-lg-1">
                                <ul className="ap-services">
                                    <li>
                                        <i className="icon_check"></i>Giảm giá 20% cho chỗ ở.
                                    </li>
                                    <li>
                                        <i className="icon_check"></i> Bữa sáng miễn phí hàng ngày.
                                    </li>

                                    <li>
                                        <i className="icon_check"></i> Wifi miễn phí.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="about-page-services">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="ap-service-item set-bg" data-setbg="img/about/about-p1.jpg">
                                    <div className="api-text">
                                        <h3>Dịch vụ nhà hàng</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="ap-service-item set-bg" data-setbg="img/about/about-p2.jpg">
                                    <div className="api-text">
                                        <h3>Du lịch & Cắm trại</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="ap-service-item set-bg" data-setbg="img/about/about-p3.jpg">
                                    <div className="api-text">
                                        <h3>Sự kiện & Tiệc tùng</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* About Us Page Section End */}

            {/* Video Section Begin */}
            <section className="video-section set-bg" data-setbg="img/video-bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="video-text">
                                <h2>Khám phá khách sạn và dịch vụ của chúng tôi.</h2>
                                <p>Đây là mùa bão nhưng chúng tôi đang đến thăm Hà Nội</p>
                                <a href="https://www.youtube.com/watch?v=EzKkl64rRbM" className="play-btn video-popup">
                                    <img src="img/play.png" alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Video Section End */}

            {/* Gallery Section Begin */}

            <section className="gallery-section spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <span>PHÒNG TRƯNG BÀY CỦA CHÚNG TÔI</span>
                                <h2>Khám phá công việc của chúng tôi</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="gallery-item set-bg" data-setbg="img/gallery/gallery-1.jpg">
                                <div className="gi-text">
                                    <h3>Phòng sang trọng</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="gallery-item set-bg" data-setbg="img/gallery/gallery-3.jpg">
                                        <div className="gi-text">
                                            <h3>Phòng sang trọng</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="gallery-item set-bg" data-setbg="img/gallery/gallery-4.jpg">
                                        <div className="gi-text">
                                            <h3>Phòng sang trọng</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="gallery-item large-item set-bg" data-setbg="img/gallery/gallery-2.jpg">
                                <div className="gi-text">
                                    <h3>Phòng sang trọng</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Gallery Section End */}
        </>
    );
}

export default AboutUS;
