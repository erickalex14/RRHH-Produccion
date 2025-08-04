import api from './api';

export const WorkSessionService = {
  getAllSessions: async () => {
    try {
      const response = await api.get('/work-sessions');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getSessionsByUserId: async (userId) => {
    try {
      const response = await api.get(`/work-sessions/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  startWork: async (data) => {
    try {
      const response = await api.post('/work-sessions/start', data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  endWork: async (sessionId, data) => {
    try {
      const response = await api.put(`/work-sessions/${sessionId}/end`, data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getTodaySession: async () => {
    try {
      const response = await api.get('/work-sessions/today');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default WorkSessionService;
