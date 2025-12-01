import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUsers } from '../store/adminSlice';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';

const AdminUserDetail = () => {
    const { userId } = useParams<{ userId: string }>();
    const dispatch: AppDispatch = useDispatch();
    
    const { users, loading, error } = useSelector((state: RootState) => state.admin);
    const user = users.find(u => u.id === userId);

    useEffect(() => {
        // Fetch all users if the specific user is not found in the state,
        // which can happen on a direct page load.
        if (!user && loading !== 'pending') {
            dispatch(fetchUsers({}));
        }
    }, [user, loading, dispatch]);

    const handleAction = (action: string) => {
        alert(`Mock Action: '${action}' for user ${user?.email}.`);
    };

    if (loading === 'pending' || (loading === 'idle' && !user)) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    if (!user) {
        return <div className="text-center text-gray-500">User not found.</div>;
    }

    return (
        <div>
            <Link to="/admin/users" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
                <Icon name="arrowLeft" className="w-5 h-5 mr-2" />
                Back to All Users
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 break-all">{user.email}</h2>
                    <p className="text-sm font-mono text-gray-500 mt-1">{user.id}</p>
                    
                    <div className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Plan:</span>
                            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                                user.plan === 'Pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>{user.plan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subscription:</span>
                             <span className={`font-semibold capitalize ${user.subscriptionStatus === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{user.subscriptionStatus}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Join Date:</span>
                            <span className="font-semibold">{new Date(user.joinDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-6 space-y-3">
                         <h3 className="text-md font-semibold text-gray-800">Admin Actions</h3>
                         <button onClick={() => handleAction('Send Password Reset')} className="w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Send Password Reset</button>
                         <button onClick={() => handleAction('Change Plan')} className="w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Change Plan</button>
                         <button onClick={() => handleAction('Deactivate Account')} className="w-full text-center px-4 py-2 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100">Deactivate Account</button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Processed Files</h2>
                     <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {user.processedFiles.length > 0 ? user.processedFiles.map(file => (
                                    <tr key={file.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.fileName}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(file.processedDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                             <span className={`font-semibold ${
                                                file.status === 'Completed' ? 'text-green-600' : 'text-red-600'
                                            }`}>{file.status}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-gray-500">No files processed.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;
