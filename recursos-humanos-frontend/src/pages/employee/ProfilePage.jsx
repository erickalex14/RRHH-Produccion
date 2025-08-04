import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Verificar que tengamos un usuario autenticado
        if (!user) {
          console.error('No hay un usuario autenticado');
          setError('No hay un usuario autenticado. Por favor, inicie sesión de nuevo.');
          return;
        }
          console.log('Intentando cargar perfil de usuario:', user.id);
        console.log('Token actual:', localStorage.getItem('token'));
        
        // Agregar configuración adicional para debugging
        const response = await axios.get('/employee/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        console.log('Respuesta del perfil:', JSON.stringify(response.data));
        
        if (!response.data) {
          throw new Error('No se recibieron datos del perfil');
        }
        
        setProfile(response.data);
        setFormData({
          email: response.data.email || '',
          address: response.data.employee_detail?.address || '',
          phone: response.data.employee_detail?.phone || '',
        });      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // Análisis detallado del error para debugging
        if (err.response) {
          console.error('Estado HTTP:', err.response.status);
          console.error('Datos de error:', JSON.stringify(err.response.data));
          console.error('Headers:', JSON.stringify(err.response.headers));
          
          if (err.response.status === 401) {
            setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
            // Redireccionar al login después de un tiempo
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 2000);
            return;
          }
        } else if (err.request) {
          console.error('No se recibió respuesta del servidor:', err.request);
          setError('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        } else {
          console.error('Error de configuración:', err.message);
          setError('Error de configuración: ' + err.message);
        }
        
        // Mensaje de error general
        setError('No se pudo cargar la información del perfil: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    
    try {
      await axios.put('/employee/profile', formData);
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Update local profile data
      setProfile((prev) => ({
        ...prev,
        email: formData.email,
        employee_detail: {
          ...prev.employee_detail,
          address: formData.address,
          phone: formData.phone,
        },
      }));
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('No se pudo actualizar la información');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const { first_name, last_name, employee_detail } = profile;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Editar
          </button>
        ) : null}
      </div>

      {updateSuccess && (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Información actualizada con éxito
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Nombres
              </label>
              <input
                type="text"
                id="first_name"
                value={first_name}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-700 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Solo administradores pueden cambiar este campo</p>
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                id="last_name"
                value={last_name}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-700 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Solo administradores pueden cambiar este campo</p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Nombres</p>
            <p className="mt-1 text-sm text-gray-900">{first_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Apellidos</p>
            <p className="mt-1 text-sm text-gray-900">{last_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
            <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Teléfono</p>
            <p className="mt-1 text-sm text-gray-900">{employee_detail?.phone || 'No especificado'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-gray-500">Dirección</p>
            <p className="mt-1 text-sm text-gray-900">{employee_detail?.address || 'No especificada'}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Información Laboral</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Cargo</p>
            <p className="mt-1 text-sm text-gray-900">{employee_detail?.role?.name || 'No asignado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Departamento</p>
            <p className="mt-1 text-sm text-gray-900">{employee_detail?.department?.name || 'No asignado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sucursal</p>
            <p className="mt-1 text-sm text-gray-900">{employee_detail?.branch?.name || 'No asignada'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Horario</p>
            <p className="mt-1 text-sm text-gray-900">
              {employee_detail?.schedule ? (
                <>
                  {employee_detail.schedule.start_time} - {employee_detail.schedule.end_time}
                </>
              ) : (
                'No asignado'
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Estado</p>
            <p className="mt-1 text-sm text-gray-900">{profile.employee_state?.name || 'No especificado'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
