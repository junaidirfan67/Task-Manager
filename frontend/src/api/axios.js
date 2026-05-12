import axios from "axios";
import demoApi from "./demoApi";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("task_manager_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("task_manager_token");
      localStorage.removeItem("task_manager_user");
    }

    return Promise.reject(error);
  }
);

export default isDemoMode ? demoApi : api;
