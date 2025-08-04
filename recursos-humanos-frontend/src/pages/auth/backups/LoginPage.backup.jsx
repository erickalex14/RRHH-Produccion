// filepath: d:\Web2\recursos_humanos\recursos-humanos-frontend\src\pages\auth\LoginPage.backup.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();  const { login } = useAuth();
  // Get redirect path from location state or default to employee dashboard
  const from = location.state?.from?.pathname || '/dashboard/employee';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log("Iniciando sesión con email:", email);
      const response = await login(email, password);
      
      console.log("Login response completa:", JSON.stringify(response));
      console.log("User details:", JSON.stringify(response.user));
      
      // Revisar empleado y detalles
      console.log("ID de usuario:", response.user.id);
      console.log("Email:", response.user.email);
      console.log("Employee detail disponible:", !!response.user.employeeDetail);
      
      if (response.user.employeeDetail) {
        console.log("Role disponible:", !!response.user.employeeDetail.role);
        console.log("Employee ID:", response.user.employeeDetail.id);
      }
      
      // Analizar la respuesta completa para debugging
      const roleInfo = response.user.employeeDetail?.role;
      console.log("Role completo:", JSON.stringify(roleInfo));
      
      // Verificar todos los posibles campos que podrían indicar que es admin
      const adminByRole = roleInfo && roleInfo.admin === 1;
      const adminByRoleName = roleInfo && roleInfo.name === 'admin';
      const adminByEmployeeDetail = response.user.employeeDetail && response.user.employeeDetail.is_admin === 1;
      const adminByDirectFlag = response.user.is_admin === 1;
      
      console.log("Es admin por role.admin:", adminByRole);
      console.log("Es admin por role.name:", adminByRoleName);
      console.log("Es admin por employeeDetail.is_admin:", adminByEmployeeDetail);
      console.log("Es admin por is_admin directo:", adminByDirectFlag);
      
      const isAdmin = adminByRole || adminByRoleName || adminByEmployeeDetail || adminByDirectFlag;
      console.log("Is admin (verificación final):", isAdmin);
      
      // Definir la ruta de redirección basada en el rol
      const redirectPath = isAdmin ? '/dashboard/admin/dashboard' : '/dashboard/employee/profile';
      
      // Informar al usuario sobre su rol antes de redireccionar
      alert(`Iniciando sesión como ${isAdmin ? 'administrador' : 'empleado'}`);
      
      // Usar setTimeout para asegurarnos de que la alerta se muestre antes de la redirección
      setTimeout(() => {
        console.log(`Redirigiendo a: ${redirectPath}`);
        navigate(redirectPath);
      }, 300);    } catch (err) {
      console.error('Login error:', err);
      // Mostrar un mensaje de error más detallado si está disponible
      if (err.message) {
        setError(`Error: ${err.message}`);
      } else if (typeof err === 'string') {
        setError(`Error: ${err}`);
      } else if (err.email && Array.isArray(err.email)) {
        setError(`${err.email[0]}`);
      } else {
        setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        <input type="hidden" name="remember" defaultValue="true" />
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
