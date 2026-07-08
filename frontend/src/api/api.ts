
import axios from 'axios';

// Create an instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true // Crucial: Allows httpOnly cookies (refresh token) to be sent automatically
});

export default api;
