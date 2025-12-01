import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUsers } from '../store/adminSlice';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';

const AdminUsers = () => {
    const dispatch: AppDispatch = useDispatch();
    const { users, loading, error } = useSelector((state: RootState) => state.admin);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('All');

    useEffect(() => {
        const params: { email?: string, plan?: string } = {};
        if (searchTerm) {
            params.email = searchTerm;
        }
        if (planFilter !== 'All') {
            params.plan = planFilter;
        }
        dispatch(fetchUsers(params));
    }, [dispatch, searchTerm, planFilter]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                         className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm rounded-md"
                    >
                        <option>All</option>
                        <option>Pro</option>
                        <option>Free</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 overflow-x-auto">
                <div className="align-middle inline-block min-w-full">
                    <div className="shadow-md overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading === 'pending' ? (
                                    <tr><td colSpan={5} className="text-center py-10"><Spinner /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-red-500">Error: {error}</td></tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{user.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.plan === 'Pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.joinDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/admin/users/${user.id}`} className="text-brand-blue-600 hover:text-brand-blue-900">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
             {loading === 'succeeded' && users.length === 0 && !error && (
                <div className="text-center py-12 text-gray-500">
                    No users found.
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
