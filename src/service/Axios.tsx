// src/service/Axios.tsx
import axios from 'axios';
// src/config/env.ts (nouveau fichier)
import { API_URL } from './env';// fallback si .env absent

const axiosInstance = axios.create({
  baseURL: API_URL,  // Proxy Vite gère le reste
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

export default axiosInstance;