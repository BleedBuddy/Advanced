import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTransactions } from '../store/adminSlice';
import { apiService } from '../services/api';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';

// A robust, reusable component for an input field with a leading lock icon.
const LockedInput = ({ label, type, placeholder, value }: { label: string; type: string; placeholder?: string; value?: string; }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="lock" className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type={type}
                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                placeholder={placeholder}
                value={value}
                readOnly
            />
        </div>
    </div>
);

// A new, clean component to provide helpful context.
const InfoBox = ({ children }: { children?: React.ReactNode }) => (
    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
        <div className="flex">
            <div className="flex-shrink-0">
                 <Icon name="info" className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
                <p className="text-sm">{children}</p>
            </div>
        </div>
    </div>
);


const AdminFinancials = () => {
    const dispatch: AppDispatch = useDispatch();
    const { transactions, loading, error } = useSelector((state: RootState) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const params: { customerEmail?: string } = {};
        if (searchTerm) {
            params.customerEmail = searchTerm;
        }
        dispatch(fetchTransactions(params));
    }, [dispatch, searchTerm]);
    
    const handleRefund = async (txnId: string) => {
        if (window.confirm('Are you sure you want to refund this transaction?')) {
            try {
                const result = await apiService.refundTransaction(txnId);
                alert(result.message);
                // Re-fetch transactions to show updated status (if backend supported it)
                dispatch(fetchTransactions({ customerEmail: searchTerm }));
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const statusStyles = {
        Succeeded: 'bg-green-100 text-green-800',
        Refunded: 'bg-yellow-100 text-yellow-800',
        Failed: 'bg-red-100 text-red-800',
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Stripe & Financials</h1>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Stripe API Keys</h2>
                <p className="mt-1 text-sm text-gray-500">Manage your connection to Stripe.</p>
                
                <InfoBox>
                    This is a demonstration panel. The API keys below are placeholders and cannot be edited.
                </InfoBox>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LockedInput
                        label="Publishable Key"
                        type="text"
                        placeholder="pk_test_************************"
                    />
                    <LockedInput
                        label="Secret Key"
                        type="password"
                        value="••••••••••••••••••••••••"
                    />
                     <div className="md:col-span-2 flex justify-end">
                        <button type="button" disabled className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed">Save Keys</button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
                 <div className="mt-4 relative w-full md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by customer email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
                    />
                </div>

                <div className="mt-4 overflow-x-auto">
                    <div className="align-middle inline-block min-w-full">
                         <div className="shadow-md overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading === 'pending' ? (
                                        <tr><td colSpan={5} className="text-center py-10"><Spinner /></td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={5} className="text-center py-10 text-red-500">Error: {error}</td></tr>
                                    ) : transactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(txn.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{txn.customerEmail}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${txn.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[txn.status]}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {txn.status === 'Succeeded' && (
                                                    <button onClick={() => handleRefund(txn.id)} className="text-brand-blue-600 hover:text-brand-blue-900">Refund</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
                 {loading === 'succeeded' && transactions.length === 0 && !error && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md mt-4 border">
                        No transactions found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFinancials;