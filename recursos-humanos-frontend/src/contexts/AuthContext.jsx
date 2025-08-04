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
  }, []);  // Login method
  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      
      // Verificar y modificar datos del usuario si es necesario
      const userData = data.user;
      
      // Verificar explícitamente si es admin para activar la bandera correcta
      let isAdminUser = false;      // Verificar si el usuario tiene role con admin = true (boolean)
      if (userData.employee_detail?.role?.admin === true) {
        console.log('Usuario identificado como admin por role.admin === true');
        isAdminUser = true;
      }
      
      console.log('Role info completo:', userData.employee_detail?.role);
      console.log('Campo admin:', userData.employee_detail?.role?.admin);
      console.log('Tipo de admin:', typeof userData.employeeDetail?.role?.admin);
      console.log('Es admin user:', isAdminUser);
      
      // Asegurar que la bandera is_admin esté correctamente establecida
      if (isAdminUser) {
        userData.is_admin = 1;
        console.log('Bandera is_admin establecida a 1 explícitamente');
      }
      
      console.log('Datos de usuario finales antes de guardar:', userData);
      
      // Guardar también en localStorage para mantener consistencia
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
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
  };  // Verificar explícitamente si el usuario es administrador
  const checkIsAdmin = () => {
    if (!user) {
      console.log("No hay usuario autenticado para verificar admin");
      return false;
    }
    
    console.log("Verificando si es admin:", user);
      // Verificar únicamente por el campo admin del rol (boolean)
    const roleInfo = user.employee_detail?.role;
    console.log("Role info en AuthContext:", JSON.stringify(roleInfo));
    
    const isAdmin = roleInfo && roleInfo.admin === true;
    
    console.log("Campo admin del rol:", roleInfo?.admin);
    console.log("Tipo de admin:", typeof roleInfo?.admin);
    console.log("Es admin (role.admin === true):", isAdmin);
    
    return isAdmin;
  };const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: checkIsAdmin,  // Pasamos la función, no la ejecutamos aquí
    checkIsAdmin           // También exponemos la función completa para debugging
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
