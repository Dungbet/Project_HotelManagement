import AboutUS from '~/pages/AboutUS';
import Booking from '~/pages/Booking';
import Contact from '~/pages/Contact';
import ForgetPassword from '~/pages/ForgotPassword';
import Home from '~/pages/Home';
import Login from '~/pages/Login';
import Order from '~/pages/Order';
import RoomDetail from '~/pages/RoomDetail';
import Rooms from '~/pages/Rooms';
import RoomAvailable from '~/pages/Rooms/RoomAvailable';
import Signup from '~/pages/Signup';
import Payment from '~/pages/Payment';
import InformationBooking from '~/pages/InformationBooking';
import PersionalInformation from '~/pages/PersionalInformation';
import EditInformation from '~/pages/PersionalInformation/EditInformation';
import ChangePassword from '~/pages/ChangePassword';

// Layout Admin
import AdminBooking from '~/pages/AdminBooking';
import AddBooking from '~/pages/AdminBooking/AddBooking';
import EditBooking from '~/pages/AdminBooking/EditBooking';
import AdminCategory from '~/pages/AdminCategory';
import AdminDashboard from '~/pages/AdminDashboard';
import AdminRoom from '~/pages/AdminRoom';
import AddRoom from '~/pages/AdminRoom/AddRoom';
import EditRoom from '~/pages/AdminRoom/EditRoom';
import AdminUser from '~/pages/AdminUser';
import AddUser from '~/pages/AdminUser/AddUser';
import AdminContact from '~/pages/AdminContact';
import AdminPayment from '~/pages/AdminPayment';
import AddPayment from '~/pages/AdminPayment/AddPayment';
import EditPayment from '~/pages/AdminPayment/EditPayment';
import AdminCoupon from '~/pages/AdminCoupon';
import AdminLogin from '~/pages/AdminLogin';
import AdminChangePassword from '~/pages/AdminChangePassword';
import AdminReview from '~/pages/AdminReview';
import AdminManager from '~/pages/AdminManager';
import AdminEmployee from '~/pages/AdminEmployee';

// Khong can login
const publicRoutes = [
    { path: '/about-us', component: AboutUS },
    { path: '/booking', component: Booking },
    { path: '/contact', component: Contact },
    { path: '/change-password', component: ChangePassword },
    { path: '/forget-password', component: ForgetPassword, layout: null },
    { path: '/', component: Home },
    { path: '/login', component: Login, layout: null },
    { path: '/order', component: Order },
    { path: '/room-detail/:id', component: RoomDetail },
    { path: '/rooms', component: Rooms },
    { path: '/rooms-available', component: RoomAvailable },
    { path: '/payment', component: Payment },
    { path: '/information-booking', component: InformationBooking },
    { path: '/persional-information', component: PersionalInformation },
    { path: '/edit-information', component: EditInformation },

    { path: '/about-us', component: AboutUS },
    { path: '/signup', component: Signup, layout: null },
];

// Login moi duoc xem
const privateRoutes = [];
const adminRoutes = [
    { path: '/admin/booking', component: AdminBooking },
    { path: '/admin/add-booking', component: AddBooking },
    { path: '/admin/edit-booking', component: EditBooking },
    { path: '/admin/category', component: AdminCategory },
    { path: '/admin/change-password', component: AdminChangePassword },
    { path: '/admin', component: AdminDashboard },
    { path: '/admin/room', component: AdminRoom },
    { path: '/admin/add-room', component: AddRoom },
    { path: '/admin/edit-room/:id', component: EditRoom },
    { path: '/admin/user', component: AdminUser },
    { path: '/admin/contact', component: AdminContact },
    { path: '/admin/add-user', component: AddUser },
    { path: '/admin/payment', component: AdminPayment },
    { path: '/admin/add-payment', component: AddPayment },
    { path: '/admin/edit-payment', component: EditPayment },
    { path: '/admin/coupon', component: AdminCoupon },
    { path: '/admin/login', component: AdminLogin, layout: null },
    { path: '/admin/review', component: AdminReview },
    { path: '/admin/manager', component: AdminManager },
    { path: '/admin/employee', component: AdminEmployee },
];
const employeeRoutes = [
    { path: '/employee/booking', component: AdminBooking },
    { path: '/employee/add-booking', component: AddBooking },
    { path: '/employee/edit-booking', component: EditBooking },
    { path: '/employee/change-password', component: AdminChangePassword },
    { path: '/employee/contact', component: AdminContact },
    { path: '/employee/payment', component: AdminPayment },
    { path: '/employee/add-payment', component: AddPayment },
    { path: '/employee/edit-payment', component: EditPayment },
    { path: '/admin/login', component: AdminLogin, layout: null },
    { path: '/employee/review', component: AdminReview },
];
const managerRoutes = [
    { path: '/manager/booking', component: AdminBooking },
    { path: '/manager/add-booking', component: AddBooking },
    { path: '/manager/edit-booking', component: EditBooking },
    { path: '/manager/category', component: AdminCategory },
    { path: '/manager/change-password', component: AdminChangePassword },
    { path: '/manager', component: AdminDashboard },
    { path: '/manager/room', component: AdminRoom },
    { path: '/manager/add-room', component: AddRoom },
    { path: '/manager/edit-room/:id', component: EditRoom },

    { path: '/manager/contact', component: AdminContact },

    { path: '/manager/payment', component: AdminPayment },
    { path: '/manager/add-payment', component: AddPayment },
    { path: '/manager/edit-payment', component: EditPayment },

    { path: '/admin/login', component: AdminLogin, layout: null },
    { path: '/manager/review', component: AdminReview },
    { path: '/manager/user', component: AdminUser },
    { path: '/manager/add-user', component: AddUser },
    { path: '/manager/employee', component: AdminEmployee },
];
export { managerRoutes, employeeRoutes, adminRoutes, publicRoutes, privateRoutes };
