import axios from 'axios';
import { API_URL } from './api.js';

const Axios = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

Axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

Axios.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 

            try {
            
                const refreshResponse = await axios.post(`${API_URL}/secret-key/admin/refresh-token`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
                    }
                });

                const newAccessToken = refreshResponse.data?.accessToken;

                if (newAccessToken) {
                    localStorage.setItem('token', newAccessToken);

                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    return Axios(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token expired or invalid:", refreshError);

                localStorage.clear();
                window.location.href = '/admin-login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default Axios;