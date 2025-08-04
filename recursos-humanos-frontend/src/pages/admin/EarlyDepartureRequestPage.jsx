import { useState, useEffect } from 'react';
import axios from '../../services/api';

const EarlyDepartureRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Assuming this endpoint exists in the backend
      const response = await axios.get('/admin/early-departure-requests');
      setRequests(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching early departure requests:', err);
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('¿Estás seguro de que quieres aprobar esta solicitud?')) {
      return;
    }
    
    try {
      await axios.put(`/admin/early-departure-requests/${requestId}/approve`);
      
      setStatusMessage({
        type: 'success',
        message: 'Solicitud aprobada correctamente',
      });
      
      fetchRequests(); // Refresh the requests list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error approving request:', err);
      
      setStatusMessage({
        type: 'error',
        message: 'Error al aprobar la solicitud',
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) {
      return;
    }
    
    try {
      await axios.put(`/admin/early-departure-requests/${requestId}/reject`);
      
      setStatusMessage({
        type: 'success',
        message: 'Solicitud rechazada correctamente',
      });
      
      fetchRequests(); // Refresh the requests list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error rejecting request:', err);
      
      setStatusMessage({
        type: 'error',
        message: 'Error al rechazar la solicitud',
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendiente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aprobada
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Solicitudes de Salida Anticipada</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona las solicitudes de salida anticipada de los empleados
        </p>
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

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron solicitudes de salida anticipada.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id || request.request_id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {request.employee?.first_name} {request.employee?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.employee?.email}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="mt-2">                      <div className="flex justify-between text-sm text-gray-900">
                        <p>
                          <span className="font-medium">Fecha:</span> {request.request_date}
                        </p>
                        <p>
                          <span className="font-medium">Hora solicitada:</span> {request.request_time}
                        </p>
                      </div>
                      
                      {request.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Motivo:</span> {request.description}
                        </p>
                      )}
                      
                      <p className="mt-1 text-sm text-gray-500">
                        Solicitado el: {new Date(request.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleApproveRequest(request.id || request.request_id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id || request.request_id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EarlyDepartureRequestPage;