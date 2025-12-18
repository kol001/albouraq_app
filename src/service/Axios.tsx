// src/service/Axios.tsx
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',  // Proxy Vite gère le reste
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

export default axiosInstance;