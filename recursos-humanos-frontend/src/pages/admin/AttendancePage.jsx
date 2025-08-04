import { useState, useEffect } from 'react';
import axios from '../../services/api';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [filters, setFilters] = useState({
    user_id: '',
    date_from: '',
    date_to: '',
    status: ''
  });

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'on_time', label: 'A tiempo' },
    { value: 'late', label: 'Tarde' },
    { value: 'absent', label: 'Ausente' }
  ];

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/attendance/all');
      setAttendance(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('No se pudo cargar la información de asistencia');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  const getAttendanceStatus = (workSession) => {
    // Implement logic to determine if the employee was on time, late, or absent
    if (!workSession.start_time) {
      return 'absent';
    }

    // Simple example - if check-in is later than 9 AM, consider it late
    const checkInTime = new Date(`1970-01-01T${workSession.start_time}`);
    const checkInHour = checkInTime.getHours();
    const checkInMinute = checkInTime.getMinutes();

    // Assuming the start time is 9:00 AM
    return (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) ? 'late' : 'on_time';
  };
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      // Si es solo tiempo (HH:mm:ss), crear una fecha completa
      let date;
      if (timeString.includes(':') && !timeString.includes('T') && !timeString.includes(' ')) {
        // Es solo tiempo como "08:30:00"
        date = new Date(`1970-01-01T${timeString}`);
      } else {
        // Es una fecha completa
        date = new Date(timeString);
      }
      
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  const calculateWorkHours = (startTime, endTime, lunchStart, lunchEnd) => {
    if (!startTime || !endTime) return 'N/A';
    
    // Create full datetime objects for calculation
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T${startTime}`);
    const end = new Date(`${today}T${endTime}`);
    let totalMs = end - start;
    
    // Subtract lunch time if available
    if (lunchStart && lunchEnd) {
      const lunchStartTime = new Date(`${today}T${lunchStart}`);
      const lunchEndTime = new Date(`${today}T${lunchEnd}`);
      const lunchTimeMs = lunchEndTime - lunchStartTime;
      totalMs -= lunchTimeMs;
    }
    
    // Convert ms to hours and minutes
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      user_id: '',
      date_from: '',
      date_to: '',
      status: ''
    });
  };
  const applyFilters = (attendanceData) => {
    return attendanceData.filter((session) => {
      const sessionDate = new Date(session.work_date || session.date);
      const sessionStatus = getAttendanceStatus(session);
      
      // Filter by user
      if (filters.user_id && session.user_id.toString() !== filters.user_id) {
        return false;
      }
      
      // Filter by date range
      if (filters.date_from) {
        const fromDate = new Date(filters.date_from);
        if (sessionDate < fromDate) return false;
      }
      
      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        toDate.setHours(23, 59, 59); // End of day
        if (sessionDate > toDate) return false;
      }
      
      // Filter by status
      if (filters.status && sessionStatus !== filters.status) {
        return false;
      }
      
      return true;
    });
  };

  const filteredAttendance = applyFilters(attendance);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Asistencia</h1>
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

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
              Empleado
            </label>
            <select
              id="user_id"
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos los empleados</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {`${user.first_name} ${user.last_name}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date_from" className="block text-sm font-medium text-gray-700">
              Fecha Desde
            </label>
            <input
              type="date"
              id="date_from"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="date_to" className="block text-sm font-medium text-gray-700">
              Fecha Hasta
            </label>
            <input
              type="date"
              id="date_to"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800">
            <p>{error}</p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No se encontraron registros de asistencia con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inicio Almuerzo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fin Almuerzo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Trabajadas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">                {filteredAttendance.map((session) => {
                  const user = users.find(u => u.user_id === session.user_id);
                  const status = getAttendanceStatus(session);
                  return (
                    <tr key={session.session_id || session.work_session_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user ? `${user.first_name} ${user.last_name}` : `ID: ${session.user_id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(session.work_date || session.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTime(session.start_time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTime(session.lunch_start)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTime(session.lunch_end)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTime(session.end_time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calculateWorkHours(session.start_time, session.end_time, session.lunch_start, session.lunch_end)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            status === 'on_time' 
                              ? 'bg-green-100 text-green-800' 
                              : status === 'late' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {
                            status === 'on_time' 
                              ? 'A tiempo' 
                              : status === 'late' 
                              ? 'Tarde' 
                              : 'Ausente'
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
