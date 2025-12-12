import axios from "axios";
import { serverConfig } from "../serverConfig";

const url = serverConfig.apiUrl;

const API_BASE_URL = url || "https://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 min for large file uploads/downloads
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
