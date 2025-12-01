// @ts-nocheck
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { logoutAdmin, checkInitialAuth } from './store/authSlice';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminUserDetail from './admin/AdminUserDetail';
import AdminFinancials from './admin/AdminFinancials';

// Main App Component
import MainApp from './MainApp';

// Protected Route Component
const ProtectedRoute = ({ isAuth, children }: { isAuth: boolean, children: JSX.Element }) => {
    const location = useLocation();
    if (!isAuth) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
};

const App = () => {
    const dispatch = useDispatch();
    const isAdminAuthenticated = useSelector((state: RootState) => state.auth.isAdminAuthenticated);

    useEffect(() => {
        // On app load, check if there's a token in localStorage to persist session
        dispatch(checkInitialAuth());
    }, [dispatch]);
    
    const handleAdminLogout = () => {
        dispatch(logoutAdmin());
    };

    return (
        <Routes>
            {/* Public-facing Application */}
            <Route path="/*" element={<MainApp />} />
            
            {/* Admin Login */}
            <Route 
                path="/admin/login" 
                element={<AdminLogin />} 
            />

            {/* Protected Admin Routes */}
            <Route 
                path="/admin/*" 
                element={
                    <ProtectedRoute isAuth={isAdminAuthenticated}>
                        <AdminLayout onLogout={handleAdminLogout}>
                            <Routes>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="users/:userId" element={<AdminUserDetail />} />
                                <Route path="financials" element={<AdminFinancials />} />
                                {/* Redirect /admin to /admin/dashboard */}
                                <Route index element={<Navigate to="dashboard" />} />
                            </Routes>
                        </AdminLayout>
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
};

export default App;