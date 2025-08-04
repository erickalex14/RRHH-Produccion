import { useState, useEffect } from 'react';
import axios from '../../services/api';
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalDocuments: 0,
    todayAttendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        employeesResponse,
        departmentsResponse,
        documentsResponse,
        attendanceResponse,
      ] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/departments'),
        axios.get('/admin/documents'),
        axios.get('/admin/attendance/all'),
      ]);

      // Helper function to get array data from response
      const getDataArray = (response) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        return [];
      };

      // Get arrays from responses
      const employees = getDataArray(employeesResponse);
      const departments = getDataArray(departmentsResponse);
      const documents = getDataArray(documentsResponse);
      const attendance = getDataArray(attendanceResponse);

      // Get today's date in ISO format for filtering attendance
      const today = new Date().toISOString().split('T')[0];
      
      // Count employees who clocked in today
      const todayAttendance = attendance.filter(
        record => record.date && record.date.split('T')[0] === today
      ).length;

      setStats({
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        totalDocuments: documents.length,
        todayAttendance,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, bgColor }) => (
    <div className={`${bgColor} overflow-hidden shadow rounded-lg`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Panel de administración</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Empleados totales" 
          value={stats.totalEmployees} 
          icon={<UsersIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />}
          bgColor="bg-white"
        />
        <StatCard 
          title="Departamentos" 
          value={stats.totalDepartments} 
          icon={<BuildingOfficeIcon className="h-6 w-6 text-green-600" aria-hidden="true" />}
          bgColor="bg-white"
        />
        <StatCard 
          title="Documentos" 
          value={stats.totalDocuments} 
          icon={<DocumentTextIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />}
          bgColor="bg-white"
        />
        <StatCard 
          title="Asistencia hoy" 
          value={stats.todayAttendance} 
          icon={<ClockIcon className="h-6 w-6 text-red-600" aria-hidden="true" />}
          bgColor="bg-white"
        />
      </div>      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
            <span>Gestionar empleados</span>
          </a>
          <a
            href="/dashboard/admin/departments"
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <BuildingOfficeIcon className="h-6 w-6 text-green-600 mr-3" />
            <span>Gestionar departamentos</span>
          </a>
          <a
            href="/dashboard/admin/roles"
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <UserGroupIcon className="h-6 w-6 text-purple-600 mr-3" />
            <span>Gestionar roles</span>
          </a>
          <a
            href="/dashboard/admin/attendance"
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ClockIcon className="h-6 w-6 text-red-600 mr-3" />
            <span>Control de asistencia</span>
          </a>
          <a
            href="/dashboard/admin/documents"
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <DocumentTextIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <span>Gestionar documentos</span>
          </a>
          <a
            href="/dashboard/admin/schedules"
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ClockIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <span>Gestionar horarios</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
