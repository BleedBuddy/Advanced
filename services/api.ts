// @ts-nocheck
import { store } from '../store';

// PRODUCTION READY:
// This checks for an environment variable 'VITE_API_URL' first.
// If your developer sets this on Google Cloud, the app will use that URL.
// If not set, it defaults to localhost (good for testing).
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:4000/api';

// A helper to get the token from the Redux state
const getToken = () => {
    return store.getState().auth.adminToken;
};

// A helper to handle responses and parsing JSON
const handleResponse = async (response) => {
    if (!response.ok) {
        // Try to parse the error message from the backend
        const errorData = await response.json().catch(() => ({ error: 'An unknown network error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// The core API service object
export const apiService = {
    // Authentication
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(response);
    },
    logout: async () => {
         const response = await fetch(`${API_BASE_URL}/admin/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        return handleResponse(response);
    },
    
    // Dashboard
    getDashboardData: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        return handleResponse(response);
    },

    // Users
    getUsers: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        return handleResponse(response);
    },
    getUserById: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        return handleResponse(response);
    },
    
    // Financials
    getFinancials: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/admin/financials?${query}`, {
             headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        return handleResponse(response);
    },
    refundTransaction: async (txnId) => {
        const response = await fetch(`${API_BASE_URL}/admin/transactions/${txnId}/refund`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        return handleResponse(response);
    }
};