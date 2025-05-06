import axios, { AxiosInstance } from 'axios';

export function getInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: 'http://localhost:8799',
  });

  if (typeof window !== "undefined") {
    instance.interceptors.request.use(config => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });
  }

  return instance;
}


export function getImdbInstance(): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.themoviedb.org/3',
  });
}