import { useState, useEffect } from 'react';
import axios from '../../services/api';

const EmployeeStatesPage = () => {
  const [employeeStates, setEmployeeStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedState, setSelectedState] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    created_by: ''
  });

  // Get current user from localStorage to set as created_by
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setFormData(prev => ({
          ...prev,
          created_by: user.user_id
        }));
      }
    } catch (err) {
      console.error('Error getting user from localStorage:', err);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeStates();
  }, []);

  const fetchEmployeeStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/employee-states');
      setEmployeeStates(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching employee states:', err);
      setError('No se pudieron cargar los estados de empleados');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const userString = localStorage.getItem('user');
    let userId = '';
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        userId = user.user_id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    setFormData({
      name: '',
      description: '',
      created_by: userId
    });
    setSelectedState(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddState = () => {
    resetForm();
    setFormMode('add');
    setShowForm(true);
  };

  const handleEditState = (state) => {
    setSelectedState(state);
    setFormMode('edit');
    
    setFormData({
      name: state.name || '',
      description: state.description || '',
      created_by: state.created_by || ''
    });

    setShowForm(true);
  };

  const handleDeleteState = async (stateId) => {
    if (!window.confirm('¿Está seguro de eliminar este estado? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`/admin/employee-states/${stateId}`);
      
      setStatusMessage({
        type: 'success',
        message: 'Estado eliminado correctamente'
      });
      
      fetchEmployeeStates();
      
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting employee state:', err);
      
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar el estado de empleado'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        await axios.post('/admin/employee-states', formData);
        setStatusMessage({
          type: 'success',
          message: 'Estado de empleado creado correctamente'
        });
      } else {
        await axios.put(`/admin/employee-states/${selectedState.employee_state_id}`, formData);
        setStatusMessage({
          type: 'success',
          message: 'Estado de empleado actualizado correctamente'
        });
      }
      
      fetchEmployeeStates();
      setShowForm(false);
      resetForm();
      
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving employee state:', err);
      
      setStatusMessage({
        type: 'error',
        message: 'Error al guardar el estado de empleado'
      });
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estados de Empleados</h1>
        <button
          onClick={handleAddState}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Estado
        </button>
      </div>
      
      {/* Status message */}
      {statusMessage && (
        <div
          className={`p-4 mb-4 rounded-md ${
            statusMessage.type === 'error'
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          <p className="text-sm font-medium">{statusMessage.message}</p>
        </div>
      )}
      
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {formMode === 'add' ? 'Agregar Estado de Empleado' : 'Editar Estado de Empleado'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {formMode === 'add' ? 'Agregar' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeStates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay estados de empleados registrados
                  </td>
                </tr>
              ) : (
                employeeStates.map((state) => (
                  <tr key={state.employee_state_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {state.employee_state_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {state.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {state.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditState(state)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteState(state.employee_state_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeStatesPage;
