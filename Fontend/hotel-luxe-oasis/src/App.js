import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import { adminRoutes } from '~/routes';
import { employeeRoutes } from '~/routes';
import { managerRoutes } from '~/routes';
import { DefaultLayout } from '~/components/Layout';
import { DefaultLayoutAdmin } from '~/components/Layout';
import { DefaultLayoutManager } from '~/components/Layout';
import { DefaultLayoutEmployee } from '~/components/Layout';
import './App.css';
// index.js hoặc App.js

import RoomDetail from './pages/RoomDetail';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicRoutes.map((route, index) => {
                        const Layout = route.layout === null ? Fragment : DefaultLayout;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                    {adminRoutes.map((route, index) => {
                        const Layout = route.layout === null ? Fragment : DefaultLayoutAdmin;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                    {managerRoutes.map((route, index) => {
                        const Layout = route.layout === null ? Fragment : DefaultLayoutManager;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                    {employeeRoutes.map((route, index) => {
                        const Layout = route.layout === null ? Fragment : DefaultLayoutEmployee;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
