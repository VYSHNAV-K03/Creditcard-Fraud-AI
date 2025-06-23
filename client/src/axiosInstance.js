import axios from 'axios';

export const apiUrl = "http://localhost:7000/"
// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:7000/api', // Base API URL
});

// Interceptor to add Authorization header with the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
    if (token) {
      config.headers['X-Auth-Token'] = token; // Add the token as X-Auth-Token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;
