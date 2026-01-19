import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Analytics API instance
export const analyticsApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'http://localhost:4001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
