import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
 headers: {
    'Content-Type': 'application/json',
  },
});


// NO NEED for token interceptors since cookies are automatically sent
// Just handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized and not a login request, redirect to login
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
