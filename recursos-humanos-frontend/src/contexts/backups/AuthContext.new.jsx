import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to restore authentication', error);
        // Clear invalid auth state
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login method
  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      // Force redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Register method
  const register = async (userData) => {
    try {
      return await AuthService.register(userData);
    } catch (error) {
      throw error;
    }
  };
  
  // Función mejorada para verificar si el usuario es administrador
  const checkIsAdmin = () => {
    if (!user) {
      console.log("No hay usuario autenticado");
      return false;
    }
    
    console.log("Verificando si es admin:", JSON.stringify(user));
    
    // Verificar todas las posibles formas de determinar si es administrador
    const roleInfo = user.employeeDetail?.role;
    
    // Crear una bandera para cada caso y logearla
    const adminByRole = roleInfo && roleInfo.admin === 1;
    const adminByRoleName = roleInfo && roleInfo.name === 'admin';
    const adminByEmployeeDetail = user.employeeDetail && user.employeeDetail.is_admin === 1;
    const adminByDirectFlag = user.is_admin === 1;
    
    console.log("Es admin por role.admin:", adminByRole);
    console.log("Es admin por role.name:", adminByRoleName);
    console.log("Es admin por employeeDetail.is_admin:", adminByEmployeeDetail);
    console.log("Es admin por is_admin directo:", adminByDirectFlag);
    
    const result = adminByRole || adminByRoleName || adminByEmployeeDetail || adminByDirectFlag;
    console.log("Resultado final isAdmin:", result);
    
    return result;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: checkIsAdmin()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
