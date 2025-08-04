import { useState, useEffect } from 'react';
import axios from '../../services/api';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedRole, setSelectedRole] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    salary: '',
    admin: false,
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
    fetchRoles();
  }, []);
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/roles');
      setRoles(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('No se pudieron cargar los roles');
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
      salary: '',
      admin: false,
      created_by: userId
    });
    setSelectedRole(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddRole = () => {
    resetForm();
    setFormMode('add');
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormMode('edit');
    
    setFormData({
      name: role.name || '',
      description: role.description || '',
      salary: role.salary || '',
      admin: role.admin || false,
      created_by: role.created_by || ''
    });
    
    setShowForm(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      return;
    }
    
    try {
      await axios.delete(`/admin/roles/${roleId}`);
      
      setStatusMessage({
        type: 'success',
        message: 'Rol eliminado correctamente',
      });
      
      fetchRoles(); // Refresh the roles list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting role:', err);
      
      let errorMessage = 'Error al eliminar el rol';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      setStatusMessage({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        await axios.post('/admin/roles', formData);
        setStatusMessage({
          type: 'success',
          message: 'Rol creado correctamente',
        });
      } else {
        await axios.put(`/admin/roles/${selectedRole.role_id}`, formData);
        setStatusMessage({
          type: 'success',
          message: 'Rol actualizado correctamente',
        });
      }
      
      fetchRoles(); // Refresh the roles list
      setShowForm(false);
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving role:', err);
      
      let errorMessage = 'Error al guardar el rol';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        errorMessage = firstError || errorMessage;
      }
      
      setStatusMessage({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Roles</h1>
        <button
          onClick={handleAddRole}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Rol
        </button>
      </div>

      {/* Status messages */}
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

      {/* Role form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {formMode === 'add' ? 'Agregar Nuevo Rol' : 'Editar Rol'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Salario
                </label>
                <input
                  type="text"
                  name="salary"
                  id="salary"
                  required
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="admin"
                    name="admin"
                    type="checkbox"
                    checked={formData.admin}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="admin" className="ml-2 block text-sm font-medium text-gray-700">
                    Rol de Administrador
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Marcar esta casilla otorga acceso administrativo al sistema.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {formMode === 'add' ? 'Crear Rol' : 'Actualizar Rol'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800">
            <p>{error}</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No hay roles registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.role_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{role.description || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{role.salary}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        role.admin 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.admin ? 'Administrador' : 'Empleado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.role_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPage;
