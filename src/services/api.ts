import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("turismo_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("turismo_token");
      localStorage.removeItem("turismo_user");
      // Optional: redirect to login or reload
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);
