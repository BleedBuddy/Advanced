// @ts-nocheck
import { store } from '../store';

// CONFIGURATION
// Use the environment variable VITE_API_URL if set (e.g. for separate backend hosting).
// Otherwise, default to an empty string to use relative paths (e.g. '/api/admin/login'),
// which works automatically when frontend and backend are on the same domain or proxied.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// HELPER: Get Auth Headers
const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// HELPER: Handle Response & Errors
const handleResponse = async (response) => {
    if (!response.ok) {
        // If 401 Unauthorized, clear token (session expired)
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
        }

        // Try to parse error message from server
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Request failed (${response.status})`);
    }
    return response.json();
};

export const apiService = {
    // Authentication
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    
    // Dashboard Data
    getDashboardData: async () => {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // Users
    getUsers: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/api/admin/users?${query}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getUserById: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    
    // Financials
    getFinancials: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/api/admin/financials?${query}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    refundTransaction: async (txnId) => {
        const response = await fetch(`${API_BASE_URL}/api/admin/transactions/${txnId}/refund`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
};
