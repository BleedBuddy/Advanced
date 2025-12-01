import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from '../components/Icon';

const AdminLayout = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-brand-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`;

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
                     <Link to="/admin" className="flex items-center space-x-2">
                        <Icon name="logo" className="w-8 h-8" />
                        <span className="font-bold text-xl">BleedBuddy</span>
                     </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavLink to="/admin/dashboard" className={navLinkClasses}>
                        <Icon name="dashboard" className="w-5 h-5 mr-3" />
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/users" className={navLinkClasses}>
                        <Icon name="users" className="w-5 h-5 mr-3" />
                        Users
                    </NavLink>
                    <NavLink to="/admin/financials" className={navLinkClasses}>
                        <Icon name="financials" className="w-5 h-5 mr-3" />
                        Financials
                    </NavLink>
                </nav>
                <div className="px-4 py-4 border-t border-gray-700">
                    <button onClick={onLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Icon name="logout" className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
