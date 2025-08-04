import api from './api';

export const EmployeeService = {
  getAllEmployees: async () => {
    try {
      const response = await api.get('/employee-details');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employee-details/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employee-details', employeeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employee-details/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employee-details/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default EmployeeService;
