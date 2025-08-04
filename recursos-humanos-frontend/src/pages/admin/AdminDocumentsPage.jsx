import { useState, useEffect } from 'react';
import axios from '../../services/api';

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [filters, setFilters] = useState({
    user_id: '',
    doc_type: '',
  });

  const documentTypes = [
    { id: 'cv', name: 'Curriculum Vitae' },
    { id: 'certificate', name: 'Certificado' },
    { id: 'id', name: 'Documento de Identidad' },
    { id: 'other', name: 'Otro' },
  ];

  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/documents');
      setDocuments(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('No se pudieron cargar los documentos');
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
      doc_type: '',
    });
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }
    
    try {
      await axios.delete(`/admin/documents/${documentId}`);
      
      setStatusMessage({
        type: 'success',
        message: 'Documento eliminado correctamente',
      });
      
      fetchDocuments(); // Refresh the documents list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting document:', err);
      
      let errorMessage = 'Error al eliminar el documento';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      setStatusMessage({
        type: 'error',
        message: errorMessage,
      });
    }
  };  const handleDownloadDocument = async (documentData) => {
    try {
      console.log('=== INICIO DESCARGA ===');
      console.log('Documento a descargar:', documentData);
      console.log('URL que se llamará:', `/admin/documents/${documentData.document_id}/download`);
      
      const response = await axios.get(`/admin/documents/${documentData.document_id}/download`, {
        responseType: 'blob',
      });
      
      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data type:', typeof response.data);
      console.log('Data size:', response.data.size);
      console.log('Data:', response.data);
      
      // Create a blob URL and trigger download (método simple que funciona)
      const blob = new Blob([response.data]);
      console.log('Blob creado:', blob);
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      console.log('URL creada:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentData.file_name || 'document.pdf');
      
      console.log('Link element:', link);
      console.log('Download attribute:', link.getAttribute('download'));
      
      document.body.appendChild(link);
      console.log('Link añadido al DOM');
      
      link.click();
      console.log('Click ejecutado');
      
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log('=== DESCARGA EXITOSA ===');
      
      setStatusMessage({
        type: 'success',
        message: 'Documento descargado correctamente',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('=== ERROR EN DESCARGA ===');
      console.error('Error completo:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error headers:', err.response?.headers);
      
      let errorMessage = 'Error al descargar el documento';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'El documento no se encontró en el servidor';
        } else if (err.response.status === 401) {
          errorMessage = 'No tienes permisos para descargar este documento';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setStatusMessage({
        type: 'error',
        message: errorMessage + ' - ' + (err.message || 'Error desconocido'),
      });
    }
  };

  // Filter documents based on filters
  const filteredDocuments = documents.filter((document) => {
    return (
      (filters.user_id === '' || document.user_id.toString() === filters.user_id) &&
      (filters.doc_type === '' || document.doc_type === filters.doc_type)
    );
  });

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Documentos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Administra todos los documentos del sistema
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

      {/* Filters */}
      <div className="flex-shrink-0 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <label htmlFor="doc_type" className="block text-sm font-medium text-gray-700">
              Tipo de Documento
            </label>
            <select
              id="doc_type"
              name="doc_type"
              value={filters.doc_type}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Documents table */}
      <div className="flex-1 bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800">
            <p>{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No hay documentos registrados.</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No se encontraron documentos con los filtros aplicados.</p>
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
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre del Archivo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Subida
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => {
                  const user = users.find(u => u.user_id === document.user_id);
                  const documentType = documentTypes.find(type => type.id === document.doc_type);
                  return (
                    <tr key={document.document_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user ? `${user.first_name} ${user.last_name}` : `ID: ${document.user_id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {documentType?.name || document.doc_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{document.file_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(document.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">                          <button
                            onClick={() => handleDownloadDocument(document)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descargar
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(document.document_id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
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

export default AdminDocumentsPage;
