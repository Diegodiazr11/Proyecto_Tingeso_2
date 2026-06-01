import axios from "axios";
import keycloak from "./keyclaok.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL:BACKEND_URL
});

api.interceptors.request.use(
  async (config) => {
    try {
      await keycloak.updateToken(30); 
      localStorage.setItem("token", keycloak.token); 
    } catch {
      keycloak.logout(); 
    }

    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;