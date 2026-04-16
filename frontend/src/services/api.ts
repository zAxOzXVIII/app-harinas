import axios from "axios";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:4000";
let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authSession = {
  setToken: (token: string | null) => {
    authToken = token;
  },
  clearToken: () => {
    authToken = null;
  },
  setUnauthorizedHandler: (handler: () => void) => {
    unauthorizedHandler = handler;
  },
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);
