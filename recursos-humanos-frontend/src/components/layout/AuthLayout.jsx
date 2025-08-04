import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            RH System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión de Recursos Humanos
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
