import axios from "axios";

const BASE_URL = "http://localhost:8000/"; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status == 401) {
      // optional: dispatch logout or clear token
      // localStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default api;
