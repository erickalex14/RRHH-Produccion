import { useState, useEffect } from 'react';
import axios from '../../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [employeeStates, setEmployeeStates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);  const [schedules, setSchedules] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    employee_state_id: '',
    department_id: '',
    role_id: '',
    schedule_id: '',
    address: '',
    phone: '',
    national_id: '',
    hire_date: '',
    birth_date: '',
  });
  useEffect(() => {
    fetchUsers();
    fetchRequiredData();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');
      setUsers(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequiredData = async () => {
    try {
      const [
        statesResponse,
        departmentsResponse,
        rolesResponse,
        schedulesResponse
      ] = await Promise.all([
        axios.get('/admin/employee-states'),
        axios.get('/admin/departments'),
        axios.get('/admin/roles'),
        axios.get('/admin/schedules')
      ]);

      setEmployeeStates(statesResponse.data.data || statesResponse.data || []);
      setDepartments(departmentsResponse.data.data || departmentsResponse.data || []);
      setRoles(rolesResponse.data.data || rolesResponse.data || []);
      setSchedules(schedulesResponse.data.data || schedulesResponse.data || []);    } catch (err) {
      console.error('Error fetching required data:', err);
      setError('Error al cargar datos necesarios');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      employee_state_id: '',
      department_id: '',
      role_id: '',
      schedule_id: '',
      address: '',
      phone: '',
      national_id: '',
      hire_date: '',
      birth_date: '',
    });
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddUser = () => {
    resetForm();
    setFormMode('add');
    setShowForm(true);
  };
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
    
    // Set basic user information
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      employee_state_id: user.employee_state_id?.toString() || '',
      department_id: user.employee_detail?.department_id?.toString() || '',
      role_id: user.employee_detail?.role_id?.toString() || '',
      schedule_id: user.employee_detail?.schedule_id?.toString() || '',
      address: user.employee_detail?.address || '',
      phone: user.employee_detail?.phone || '',
      national_id: user.employee_detail?.national_id || '',
      hire_date: user.employee_detail?.hire_date || '',
      birth_date: user.employee_detail?.birth_date || '',
    });
    
    setShowForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    
    try {
      await axios.delete(`/admin/users/${userId}`);
      
      setStatusMessage({
        type: 'success',
        message: 'Usuario eliminado correctamente',
      });
      
      fetchUsers(); // Refresh the users list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar el usuario',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        await axios.post('/admin/users', formData);
        setStatusMessage({
          type: 'success',
          message: 'Usuario creado correctamente',
        });
      } else {
        await axios.put(`/admin/users/${selectedUser.user_id}`, formData);
        setStatusMessage({
          type: 'success',
          message: 'Usuario actualizado correctamente',
        });
      }
      
      fetchUsers(); // Refresh the users list
      setShowForm(false);
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving user:', err);
      
      let errorMessage = 'Error al guardar el usuario';
      
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

  // Función para filtrar usuarios por cédula o nombre
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const nationalId = user.employee_detail?.national_id || '';
    
    return (
      fullName.includes(searchLower) ||
      nationalId.includes(searchTerm)
    );
  });

  // Función para mostrar detalles del usuario
  const handleViewDetails = async (user) => {
    try {
      setUserDetails(user);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error viewing user details:', err);
    }
  };

  // Función para manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Empleados</h1>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Empleado
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

      {/* User form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {formMode === 'add' ? 'Agregar Nuevo Empleado' : 'Editar Empleado'}
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
              {/* Personal Information */}
              <div className="sm:col-span-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Información Personal</h3>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Nombres
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Password fields - only required for new users */}
              {formMode === 'add' && (
                <>
                  <div className="sm:col-span-3">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      required
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Employment Information */}
              <div className="sm:col-span-6">
                <h3 className="text-md font-medium text-gray-900 mb-2">Información Laboral</h3>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="employee_state_id" className="block text-sm font-medium text-gray-700">
                  Estado de Empleado
                </label>
                <select
                  id="employee_state_id"
                  name="employee_state_id"
                  required
                  value={formData.employee_state_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccione un estado</option>
                  {employeeStates.map((state) => (
                    <option key={state.employee_state_id} value={state.employee_state_id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                  Departamento
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  required
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccione un departamento</option>
                  {departments.map((department) => (
                    <option key={department.department_id} value={department.department_id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  required
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccione un cargo</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>              <div className="sm:col-span-3">
                <label htmlFor="schedule_id" className="block text-sm font-medium text-gray-700">
                  Horario
                </label>
                <select
                  id="schedule_id"
                  name="schedule_id"
                  required
                  value={formData.schedule_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccione un horario</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.schedule_id} value={schedule.schedule_id}>
                      {schedule.name} ({schedule.start_time} - {schedule.end_time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="national_id" className="block text-sm font-medium text-gray-700">
                  Cédula
                </label>
                <input
                  type="text"
                  name="national_id"
                  id="national_id"
                  required
                  maxLength="10"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">
                  Fecha de Contratación
                </label>
                <input
                  type="date"
                  name="hire_date"
                  id="hire_date"
                  required
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="birth_date"
                  id="birth_date"
                  required
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
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
                {formMode === 'add' ? 'Crear Empleado' : 'Actualizar Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}      {/* Search bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Buscar por nombre o cédula
          </label>
          {searchTerm && (
            <span className="text-sm text-gray-500">
              {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Ingrese nombre o cédula"
          />
          <button
            onClick={clearSearch}
            className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800">
            <p>{error}</p>
          </div>        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? (
              <div>
                <p>No se encontraron empleados que coincidan con "{searchTerm}"</p>
                <button
                  onClick={clearSearch}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <p>No hay empleados registrados.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.employee_detail?.national_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.employee_state?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.employee_detail?.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.employee_detail?.role?.name || 'N/A'}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
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
      </div>      {/* User details modal */}
      {showDetailsModal && userDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDetailsModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalles del Empleado</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
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

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nombre:</span>
                    <div className="text-sm text-gray-900">
                      {userDetails.first_name} {userDetails.last_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Correo Electrónico:</span>
                    <div className="text-sm text-gray-900">{userDetails.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Teléfono:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Dirección:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.address || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cédula:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.national_id || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha de Contratación:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.hire_date || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha de Nacimiento:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.birth_date || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Estado de Empleado:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_state?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Departamento:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.department?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Sucursal:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.department?.branch?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Compañía:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.department?.branch?.company?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cargo:</span>
                    <div className="text-sm text-gray-900">{userDetails.employee_detail?.role?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Horario:</span>
                    <div className="text-sm text-gray-900">
                      {userDetails.employee_detail?.schedule?.name ? 
                        `${userDetails.employee_detail.schedule.name} (${userDetails.employee_detail.schedule.start_time} - ${userDetails.employee_detail.schedule.end_time})` 
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
