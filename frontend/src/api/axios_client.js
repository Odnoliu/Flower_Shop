import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3001", // API mock
  headers: {
    "Content-Type": "application/json",
  },
});

// Có thể thêm interceptors ở đây nếu cần
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
