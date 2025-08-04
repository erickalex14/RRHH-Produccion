import api from './api';
import axios from 'axios';

export const AuthService = {  // Función para obtener el CSRF token antes de iniciar sesión
  getCsrfToken: async () => {
    try {
      console.log('Intentando obtener CSRF token...');
      await axios.get('/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      console.log('CSRF token obtenido correctamente');
    } catch (error) {
      console.error('Error al obtener CSRF token:', error);
      if (error.response) {
        console.error('Detalles del error de CSRF:', error.response.data);
        console.error('Estado HTTP:', error.response.status);
      }
      throw error;
    }
  },
    login: async (email, password) => {
    try {
      // Obtener CSRF token primero
      await AuthService.getCsrfToken();
      
      console.log('Intentando iniciar sesión con:', { email, password });
      
      // Añadir un timeout más largo para debugging
      const response = await api.post('/auth/login', { email, password }, {
        timeout: 10000, // 10 segundos
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // Ajuste para manejar tanto 'token' como 'access_token'
      const token = response.data.access_token || response.data.token;
      const { user } = response.data;
      
      console.log('Token recibido:', token);
      console.log('Información de usuario:', user);
      
      // Store authentication data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Error detallado de login:', error);
      if (error.response) {
        console.error('Datos del error:', error.response.data);
        console.error('Estado HTTP:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No se recibió respuesta. Detalles de la solicitud:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
      throw error.response ? error.response.data : error;
    }
  },
    logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default AuthService;
