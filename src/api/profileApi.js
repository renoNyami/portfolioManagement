import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Or your full backend URL if different

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchUserProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/profile`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.put(`${API_BASE_URL}/profile`, profileData);
  return response.data;
};

