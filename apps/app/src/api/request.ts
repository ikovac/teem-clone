import app from '@/app';
import router from '@/router';
import axios from 'axios';

const instance = axios.create({
  baseURL: new URL('api', import.meta.env.VITE_API_BASE_URL).href,
});

instance.interceptors.request.use(async config => {
  const token =
    await app.config.globalProperties.$auth0.getAccessTokenSilently();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // await app.config.globalProperties.$auth0.loginWithRedirect();
      router.push({ name: 'dashboard' });
    }
    throw error;
  },
);

export default instance;
