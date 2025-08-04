import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../services/api';
import { ClockIcon } from '@heroicons/react/24/outline';

const AttendancePage = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchAttendanceData();
  }, []);  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employee/attendance');
      
      // Extract data from response
      const records = response.data.data || response.data || [];
      
      // Sort records by date, most recent first
      const sortedRecords = records.sort((a, b) => 
        new Date(b.work_date || b.date) - new Date(a.work_date || a.date)
      );
      
      setAttendanceRecords(sortedRecords);
      
      // Check if there's an active session for today
      const today = new Date().toISOString().split('T')[0];
      const activeSession = sortedRecords.find(
        record => {
          const recordDate = record.work_date || record.date;
          return recordDate && recordDate.split('T')[0] === today && !record.end_time;
        }
      );
      
      if (activeSession) {
        setCurrentSession(activeSession);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('No se pudieron cargar los registros de asistencia');
    } finally {
      setLoading(false);
    }
  };
  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post('/employee/attendance/start');
      const sessionData = response.data.data || response.data;
      setCurrentSession(sessionData);
      
      showStatusMessage('success', 'Se ha registrado tu entrada correctamente');
      fetchAttendanceData();
    } catch (err) {
      console.error('Error registering start time:', err);
      showStatusMessage('error', 'Error al registrar la entrada');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndWork = async () => {
    try {
      setActionLoading(true);
      await axios.post('/employee/attendance/end');
      setCurrentSession(null);
      
      showStatusMessage('success', 'Se ha registrado tu salida correctamente');
      fetchAttendanceData();
    } catch (err) {
      console.error('Error registering end time:', err);
      showStatusMessage('error', 'Error al registrar la salida');
    } finally {
      setActionLoading(false);
    }
  };
  const handleStartLunch = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post('/employee/attendance/lunch-start');
      const responseData = response.data.data || response.data;
      setCurrentSession(prev => ({ ...prev, lunch_start: responseData.lunch_start }));
      
      showStatusMessage('success', 'Se ha registrado el inicio de tu almuerzo correctamente');
      fetchAttendanceData();
    } catch (err) {
      console.error('Error registering lunch start time:', err);
      showStatusMessage('error', 'Error al registrar el inicio del almuerzo');
    } finally {
      setActionLoading(false);
    }
  };
  const handleEndLunch = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post('/employee/attendance/lunch-end');
      const responseData = response.data.data || response.data;
      setCurrentSession(prev => ({ ...prev, lunch_end: responseData.lunch_end }));
      
      showStatusMessage('success', 'Se ha registrado el fin de tu almuerzo correctamente');
      fetchAttendanceData();
    } catch (err) {
      console.error('Error registering lunch end time:', err);
      showStatusMessage('error', 'Error al registrar el fin del almuerzo');
    } finally {
      setActionLoading(false);
    }
  };

  const showStatusMessage = (type, message) => {
    setStatusMessage({ type, message });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '—';
    try {
      // Si es solo tiempo (HH:mm:ss), crear una fecha completa
      let date;
      if (dateTimeString.includes(':') && !dateTimeString.includes('T')) {
        // Es solo tiempo como "08:30:00"
        date = new Date(`1970-01-01T${dateTimeString}`);
      } else {
        // Es una fecha completa
        date = new Date(dateTimeString);
      }
      
      if (isNaN(date.getTime())) return '—';
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', dateTimeString, error);
      return '—';
    }
  };const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '—';
    }
  };

  const calculateHoursWorked = (startTime, endTime, lunchStart, lunchEnd) => {
    if (!startTime || !endTime) return '—';
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    let lunchDuration = 0;
    if (lunchStart && lunchEnd) {
      lunchDuration = new Date(lunchEnd).getTime() - new Date(lunchStart).getTime();
    }
    
    const totalMilliseconds = (end - start) - lunchDuration;
    const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Control de Asistencia</h2>
      
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

      {/* Clock in/out actions */}
      <div className="mb-8 p-6 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Registro de hoy</h3>
        <div className="flex flex-wrap gap-4 items-center">
          {!currentSession ? (
            <button
              onClick={handleStartWork}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ClockIcon className="mr-2 h-5 w-5" />
              Iniciar jornada
            </button>
          ) : (
            <>
              <button
                onClick={handleEndWork}
                disabled={actionLoading}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ClockIcon className="mr-2 h-5 w-5" />
                Finalizar jornada
              </button>
              
              {!currentSession.lunch_start ? (
                <button
                  onClick={handleStartLunch}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <ClockIcon className="mr-2 h-5 w-5" />
                  Iniciar almuerzo
                </button>
              ) : !currentSession.lunch_end ? (
                <button
                  onClick={handleEndLunch}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ClockIcon className="mr-2 h-5 w-5" />
                  Finalizar almuerzo
                </button>
              ) : null}
            </>
          )}
        </div>

        {currentSession && (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Entrada</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatTime(currentSession.start_time)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Inicio almuerzo</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatTime(currentSession.lunch_start)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fin almuerzo</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatTime(currentSession.lunch_end)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salida</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatTime(currentSession.end_time)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Attendance history */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de asistencia</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay registros de asistencia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Entrada
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Inicio almuerzo
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fin almuerzo
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Salida
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Horas trabajadas
                  </th>
                </tr>
              </thead>              <tbody className="bg-white divide-y divide-gray-200">                {attendanceRecords.map((record) => (
                  <tr key={record.session_id || record.work_session_id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(record.work_date || record.date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.start_time)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.lunch_start)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.lunch_end)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.end_time)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateHoursWorked(record.start_time, record.end_time, record.lunch_start, record.lunch_end)}
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

export default AttendancePage;
