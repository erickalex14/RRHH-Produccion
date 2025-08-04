import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  UserIcon, 
  UsersIcon, 
  ClockIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Bars3Icon, 
  XMarkIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  CalendarIcon,
  HomeIcon,  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isMobile, closeMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };
  const isAdmin = !!user?.employeeDetail?.role?.admin;
  const isInAdminSection = location.pathname.includes('/dashboard/admin');
  
  // Debug más detallado
  console.log('=== SIDEBAR DEBUG ===');
  console.log('Current path:', location.pathname);
  console.log('User object:', user);
  console.log('Employee detail:', user?.employeeDetail);
  console.log('Role:', user?.employeeDetail?.role);
  console.log('Admin flag:', user?.employeeDetail?.role?.admin);
  console.log('Is admin user:', isAdmin);
  console.log('Is in admin section:', isInAdminSection);
  console.log('====================');
  const employeeNavigation = [
    { name: 'Inicio', href: '/dashboard/employee', icon: HomeIcon },
    { name: 'Mi Perfil', href: '/dashboard/employee/profile', icon: UserIcon },
    { name: 'Mis Documentos', href: '/dashboard/employee/documents', icon: DocumentTextIcon },
    { name: 'Mi Asistencia', href: '/dashboard/employee/attendance', icon: ClockIcon },
    { name: 'Solicitudes de Salida', href: '/dashboard/employee/early-departure', icon: ClipboardDocumentListIcon },
  ];
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard/admin/dashboard', icon: ChartBarIcon },
    { name: 'Empleados', href: '/dashboard/admin/users', icon: UsersIcon },
    { name: 'Estados de Empleados', href: '/dashboard/admin/employee-states', icon: UsersIcon },
    { name: 'Compañías', href: '/dashboard/admin/companies', icon: BuildingOfficeIcon },
    { name: 'Sucursales', href: '/dashboard/admin/branches', icon: BuildingStorefrontIcon },
    { name: 'Departamentos', href: '/dashboard/admin/departments', icon: BuildingOfficeIcon },
    { name: 'Roles', href: '/dashboard/admin/roles', icon: UserGroupIcon },
    { name: 'Horarios', href: '/dashboard/admin/schedules', icon: CalendarIcon },
    { name: 'Solicitudes Salida Anticipada', href: '/dashboard/admin/early-departure', icon: ClipboardDocumentCheckIcon },
    { name: 'Documentos', href: '/dashboard/admin/documents', icon: DocumentTextIcon },
    { name: 'Asistencia', href: '/dashboard/admin/attendance', icon: ClockIcon }
  ];// Para administradores, mostrar ambas secciones dependiendo de donde estén
  // Para empleados regulares, solo mostrar navegación de empleado
  let navigation;
  
  // FORZAR navegación admin si estás en ruta admin (temporal para debug)
  if (isInAdminSection) {
    navigation = adminNavigation;
    console.log('FORCING admin navigation because in admin section');
  } else if (isAdmin) {
    navigation = employeeNavigation;
    console.log('Showing employee navigation for admin user');
  } else {
    navigation = employeeNavigation;
    console.log('Showing employee navigation for regular user');
  }
  
  console.log('Selected navigation:', navigation.map(item => item.name));return (
    <div className={`flex flex-col h-full bg-gray-800 text-white ${isMobile ? 'w-full' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">RH System</h1>
        {isMobile && (
          <button onClick={closeMobileMenu} className="text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Toggle for Admins */}
      {isAdmin && (
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2">SECCIÓN ACTUAL</div>
          <div className="text-sm font-medium text-white">
            {isInAdminSection ? 'Panel de Administración' : 'Panel de Empleado'}
          </div>
          {isInAdminSection && (
            <Link
              to="/dashboard/employee"
              className="flex items-center mt-2 text-xs text-blue-300 hover:text-blue-200"
              onClick={() => {
                if (isMobile) closeMobileMenu();
              }}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Volver a empleado
            </Link>
          )}
          {!isInAdminSection && (
            <Link
              to="/dashboard/admin"
              className="flex items-center mt-2 text-xs text-green-300 hover:text-green-200"
              onClick={() => {
                if (isMobile) closeMobileMenu();
              }}
            >
              <ChartBarIcon className="w-4 h-4 mr-1" />
              Ir a administración
            </Link>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (isMobile) closeMobileMenu();
                }}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const Header = ({ openMobileMenu }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isAdmin = !!user?.employeeDetail?.role?.admin;
  const isInAdminSection = location.pathname.includes('/dashboard/admin');
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/admin/dashboard')) return 'Dashboard Administrativo';
    if (path.includes('/dashboard/admin/users')) return 'Gestión de Empleados';
    if (path.includes('/dashboard/admin/companies')) return 'Gestión de Compañías';
    if (path.includes('/dashboard/admin/branches')) return 'Gestión de Sucursales';
    if (path.includes('/dashboard/admin/departments')) return 'Gestión de Departamentos';
    if (path.includes('/dashboard/admin/roles')) return 'Gestión de Roles';
    if (path.includes('/dashboard/admin/schedules')) return 'Gestión de Horarios';
    if (path.includes('/dashboard/admin/employee-states')) return 'Estados de Empleados';
    if (path.includes('/dashboard/admin/documents')) return 'Documentos Administrativos';
    if (path.includes('/dashboard/admin/attendance')) return 'Control de Asistencia';
    if (path.includes('/dashboard/employee/profile')) return 'Mi Perfil';
    if (path.includes('/dashboard/employee/documents')) return 'Mis Documentos';
    if (path.includes('/dashboard/employee/attendance')) return 'Mi Asistencia';
    if (path.includes('/dashboard/employee')) return 'Panel de Empleado';
    return 'Sistema RH';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 mr-2"
            onClick={openMobileMenu}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            {isAdmin && (
              <p className="text-sm text-gray-500">
                {isInAdminSection ? 'Administrador' : 'Vista de Empleado'}
              </p>
            )}
          </div>
        </div>
        <div className="flex-1 md:flex md:items-center md:justify-end">
          <div className="ml-3 relative flex items-center">
            <UserIcon className="h-6 w-6 text-gray-600 mr-2" />
            <div className="text-right">
              <span className="block text-gray-800 font-medium">
                {user?.first_name} {user?.last_name}
              </span>
              {isAdmin && (
                <span className="block text-xs text-gray-500">
                  {user?.employeeDetail?.role?.name || 'Administrador'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 z-50">
            <Sidebar isMobile={true} closeMobileMenu={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar isMobile={false} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header openMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
