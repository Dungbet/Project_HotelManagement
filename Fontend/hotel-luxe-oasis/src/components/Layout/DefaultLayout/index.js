import Header from './Header';
import Footer from './Footer';
import ChatIcon from './ChatIcon';

function DefaultLayout({ children }) {
    return (
        <>
            <Header />
            {children}
            <ChatIcon />
            <Footer />
        </>
    );
}

export default DefaultLayout;
