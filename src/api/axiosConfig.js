import axios from 'axios';

const api = axios.create({
  baseURL: 'https://supermarket-backend-2-zel8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export default api;