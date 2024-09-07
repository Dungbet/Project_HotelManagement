import React from 'react';

function Footer() {
    return (
        <>
            {/* Footer Section Begin */}
            <footer className="footer-section">
                <div className="container">
                    <div className="footer-text">
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="ft-about">
                                    <div className="logo">
                                        <a href="#">
                                            {/* Self-closed img tag */}
                                            <img src="img/footer-logo.png" alt="" />
                                        </a>
                                    </div>
                                    <p>Sự lựa chọn hàng đầu...</p>
                                    <div className="fa-social">
                                        <a href="#">
                                            <i className="fa fa-facebook"></i>
                                        </a>
                                        <a href="#">
                                            <i className="fa fa-twitter"></i>
                                        </a>
                                        <a href="#">
                                            <i className="fa fa-tripadvisor"></i>
                                        </a>
                                        <a href="#">
                                            <i className="fa fa-instagram"></i>
                                        </a>
                                        <a href="#">
                                            <i className="fa fa-youtube-play"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 offset-lg-1">
                                <div className="ft-contact">
                                    <h6>Liên hệ chúng rôi</h6>
                                    <ul>
                                        <li>0974410454</li>
                                        <li>taquangdung050503@gmail.com</li>
                                        <li>Thanh Vân, Hiệp Hòa, Bắc Giang</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-3 offset-lg-1">
                                <div className="ft-newslatter">
                                    <h6>MỚI NHẤT</h6>
                                    <p>Nhận các cập nhật và ưu đãi mới nhất.</p>
                                    <form action="#" className="fn-form">
                                        {/* Self-closed input tag */}
                                        <input type="text" placeholder="Email" />
                                        <button type="submit">
                                            <i className="fa fa-send"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright-option">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-7">
                                <p>Bản quyền ©2024 đã được bảo lưu | by TaQuangDung</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            {/* Footer Section End */}

            {/* Search model Begin */}
            <div className="search-model">
                <div className="h-100 d-flex align-items-center justify-content-center">
                    <div className="search-close-switch">
                        <i className="icon_close"></i>
                    </div>
                    <form className="search-model-form">
                        {/* Self-closed input tag */}
                        <input type="text" id="search-input" placeholder="Search here....." />
                    </form>
                </div>
            </div>
            {/* Search model end */}
        </>
    );
}

export default Footer;
