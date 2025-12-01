import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDashboardData } from '../store/adminSlice';

import LineChart from '../components/LineChart';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

const AdminDashboard = () => {
    const dispatch: AppDispatch = useDispatch();
    const { recentActivity, revenueData, loading, error } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    if (loading === 'pending' || loading === 'idle') {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Revenue */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-brand-blue-100 rounded-md p-3">
                           <Icon name="stats" className="h-6 w-6 text-brand-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.totalRevenue)}</p>
                    </div>
                </div>

                {/* Card 2: Monthly Recurring Revenue */}
                 <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                     <div className="flex items-center">
                        <div className="flex-shrink-0 bg-cyan-100 rounded-md p-3">
                           <Icon name="financials" className="h-6 w-6 text-cyan-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.mrr)}</p>
                    </div>
                </div>

                {/* Card 3: New Users (30 Days) */}
                 <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-pink-100 rounded-md p-3">
                           <Icon name="newUser" className="h-6 w-6 text-pink-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">New Users (30 Days)</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(revenueData.newUsers)}</p>
                    </div>
                </div>

                {/* Card 4: Total Files Processed */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                     <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                           <Icon name="filesProcessed" className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Total Files Processed</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(revenueData.filesProcessed)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Revenue Over Last 6 Months</h2>
                    <div className="mt-4 h-80">
                         <LineChart data={revenueData.chartData} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                    <ul className="mt-4 space-y-4">
                        {recentActivity.map(activity => (
                             <li key={activity.id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 rounded-full">
                                    {activity.action.includes('processed') ? (
                                        <Icon name="checkCircle" className="h-4 w-4 text-green-600" strokeWidth={2} />
                                    ) : (
                                        <Icon name="magicStars" className="h-4 w-4 text-yellow-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">{activity.userEmail}</span> {activity.action}.
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
