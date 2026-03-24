import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.13.70:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
