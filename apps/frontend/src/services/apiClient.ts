import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",

  // Sends the authentication cookie with every request
  withCredentials: true,
});
