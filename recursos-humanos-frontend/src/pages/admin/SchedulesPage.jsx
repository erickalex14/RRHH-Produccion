import { useState, useEffect } from 'react';
import axios from '../../services/api';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    lunch_start_time: '',
    lunch_end_time: '',
    description: '',
    active: true,
    days_of_week: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  useEffect(() => {
    fetchSchedules();
  }, []);
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/schedules');
      setSchedules(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('No se pudieron cargar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      lunch_start_time: '',
      lunch_end_time: '',
      description: '',
      active: true,
      days_of_week: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    });
    setSelectedSchedule(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' && name === 'active' ? checked : value,
    });
  };

  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      days_of_week: {
        ...formData.days_of_week,
        [day]: !formData.days_of_week[day],
      },
    });
  };

  const handleAddSchedule = () => {
    resetForm();
    setFormMode('add');
    setShowForm(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setFormMode('edit');
    // Parse days of week from string if needed
    let daysOfWeek = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    if (schedule.days_of_week) {
      if (typeof schedule.days_of_week === 'string') {
        try {
          daysOfWeek = JSON.parse(schedule.days_of_week);
        } catch (e) {
          console.error('Error parsing days of week:', e);
        }
      } else if (typeof schedule.days_of_week === 'object') {
        daysOfWeek = schedule.days_of_week;
      }
    }
    setFormData({
      name: schedule.name || '',
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      lunch_start_time: schedule.lunch_start || '',
      lunch_end_time: schedule.lunch_end || '',
      description: schedule.description || '',
      active: typeof schedule.active === 'boolean' ? schedule.active : true,
      days_of_week: daysOfWeek,
    });
    setShowForm(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return;
    }

    try {
      await axios.delete(`/admin/schedules/${scheduleId}`);

      setStatusMessage({
        type: 'success',
        message: 'Horario eliminado correctamente',
      });

      fetchSchedules(); // Refresh the schedules list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting schedule:', err);

      let errorMessage = 'Error al eliminar el horario';

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      setStatusMessage({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        ...formData,
        lunch_start: formData.lunch_start_time,
        lunch_end: formData.lunch_end_time,
        days_of_week: JSON.stringify(formData.days_of_week),
      };
      delete scheduleData.lunch_start_time;
      delete scheduleData.lunch_end_time;
      if (formMode === 'add') {
        await axios.post('/admin/schedules', scheduleData);
        setStatusMessage({
          type: 'success',
          message: 'Horario creado correctamente',
        });
      } else {
        await axios.put(`/admin/schedules/${selectedSchedule.schedule_id}`, scheduleData);
        setStatusMessage({
          type: 'success',
          message: 'Horario actualizado correctamente',
        });
      }
      fetchSchedules(); // Refresh the schedules list
      setShowForm(false);
      resetForm();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving schedule:', err);
      let errorMessage = 'Error al guardar el horario';
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

  const formatDaysOfWeek = (daysOfWeekStr) => {
    if (!daysOfWeekStr) return 'No especificado';

    let daysOfWeek;
    if (typeof daysOfWeekStr === 'string') {
      try {
        daysOfWeek = JSON.parse(daysOfWeekStr);
      } catch (e) {
        return 'Error en formato';
      }
    } else {
      daysOfWeek = daysOfWeekStr;
    }

    const days = [];
    if (daysOfWeek.monday) days.push('Lun');
    if (daysOfWeek.tuesday) days.push('Mar');
    if (daysOfWeek.wednesday) days.push('Mié');
    if (daysOfWeek.thursday) days.push('Jue');
    if (daysOfWeek.friday) days.push('Vie');
    if (daysOfWeek.saturday) days.push('Sáb');
    if (daysOfWeek.sunday) days.push('Dom');

    return days.length > 0 ? days.join(', ') : 'Ningún día seleccionado';
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Horarios</h1>
        <button
          onClick={handleAddSchedule}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Horario
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

      {/* Schedule form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {formMode === 'add' ? 'Agregar Nuevo Horario' : 'Editar Horario'}
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
            <div className="sm:col-span-3 flex items-center">
              <label htmlFor="active" className="block text-sm font-medium text-gray-700 mr-2">
                Activo
              </label>
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre del Horario
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  name="start_time"
                  id="start_time"
                  required
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  name="end_time"
                  id="end_time"
                  required
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="lunch_start_time" className="block text-sm font-medium text-gray-700">
                  Inicio de Almuerzo
                </label>
                <input
                  type="time"
                  name="lunch_start_time"
                  id="lunch_start_time"
                  value={formData.lunch_start_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="lunch_end_time" className="block text-sm font-medium text-gray-700">
                  Fin de Almuerzo
                </label>
                <input
                  type="time"
                  name="lunch_end_time"
                  id="lunch_end_time"
                  value={formData.lunch_end_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de la Semana
                </label>
                <div className="mt-1 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      id="monday"
                      type="checkbox"
                      checked={formData.days_of_week.monday}
                      onChange={() => handleDayToggle('monday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="monday" className="ml-2 text-sm text-gray-700">
                      Lunes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="tuesday"
                      type="checkbox"
                      checked={formData.days_of_week.tuesday}
                      onChange={() => handleDayToggle('tuesday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tuesday" className="ml-2 text-sm text-gray-700">
                      Martes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="wednesday"
                      type="checkbox"
                      checked={formData.days_of_week.wednesday}
                      onChange={() => handleDayToggle('wednesday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="wednesday" className="ml-2 text-sm text-gray-700">
                      Miércoles
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="thursday"
                      type="checkbox"
                      checked={formData.days_of_week.thursday}
                      onChange={() => handleDayToggle('thursday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="thursday" className="ml-2 text-sm text-gray-700">
                      Jueves
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="friday"
                      type="checkbox"
                      checked={formData.days_of_week.friday}
                      onChange={() => handleDayToggle('friday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="friday" className="ml-2 text-sm text-gray-700">
                      Viernes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="saturday"
                      type="checkbox"
                      checked={formData.days_of_week.saturday}
                      onChange={() => handleDayToggle('saturday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saturday" className="ml-2 text-sm text-gray-700">
                      Sábado
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="sunday"
                      type="checkbox"
                      checked={formData.days_of_week.sunday}
                      onChange={() => handleDayToggle('sunday')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sunday" className="ml-2 text-sm text-gray-700">
                      Domingo
                    </label>
                  </div>
                </div>
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
                {formMode === 'add' ? 'Crear Horario' : 'Actualizar Horario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedules table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800">
            <p>{error}</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No hay horarios registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Almuerzo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.schedule_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                      <div className="text-sm text-gray-500">{schedule.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.start_time} - {schedule.end_time}
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      {schedule.lunch_start && schedule.lunch_end ? (
                        <div className="text-sm text-gray-900">
                          {schedule.lunch_start} - {schedule.lunch_end}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No definido</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDaysOfWeek(schedule.days_of_week)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.schedule_id)}
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
      </div>
    </div>
  );
};

export default SchedulesPage;
