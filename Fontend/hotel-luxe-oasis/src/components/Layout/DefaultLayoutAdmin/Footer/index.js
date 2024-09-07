import React from 'react';

function Footer() {
    return (
        <div className="container-fluid pt-4 px-4">
            <div className="bg-light rounded-top p-4">
                <div className="row">
                    <div className="col-12 col-sm-6 text-center text-sm-start">
                        &copy; <a href="#">Your Site Name</a>, All Right Reserved.
                    </div>
                    <div className="col-12 col-sm-6 text-center text-sm-end">
                        Designed By <a href="https://htmlcodex.com">HTML Codex</a>
                        <br />
                        Distributed By{' '}
                        <a className="border-bottom" href="https://themewagon.com" target="_blank">
                            ThemeWagon
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
