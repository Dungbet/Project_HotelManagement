import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

function DefaultLayoutEmployee({ children }) {
    return (
        <div class="container-xxl position-relative bg-white d-flex p-0">
            <Sidebar />
            <div class="content">
                <Header />
                {children}
                <Footer />
            </div>
        </div>
    );
}

export default DefaultLayoutEmployee;
