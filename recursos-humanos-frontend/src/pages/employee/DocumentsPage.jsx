import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../services/api';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('cv'); // Default document type

  const documentTypes = [
    { id: 'cv', name: 'Curriculum Vitae' },
    { id: 'certificate', name: 'Certificado' },
    { id: 'id', name: 'Documento de Identidad' },
    { id: 'other', name: 'Otro' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employee/documents');
      console.log('Documents response:', response.data);
      setDocuments(response.data.data || response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      if (err.response?.status === 404) {
        // No documents found, set empty array
        setDocuments([]);
        setError('');
      } else {
        setError('No se pudieron cargar los documentos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadStatus({
        type: 'error',
        message: 'Por favor, selecciona un archivo',
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: 'El archivo es demasiado grande. El tamaño máximo es 5MB',
      });
      return;
    }
    
    // Check file type (only PDFs)
    if (file.type !== 'application/pdf') {
      setUploadStatus({
        type: 'error',
        message: 'Solo se permiten archivos PDF',
      });
      return;
    }
    
    try {
      setUploadStatus({
        type: 'loading',
        message: 'Subiendo documento...',
      });
        const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      
      await axios.post('/employee/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadStatus({
        type: 'success',
        message: 'Documento subido con éxito',
      });
      
      setFile(null);
      fetchDocuments(); // Refresh documents list
      
      // Reset form
      document.getElementById('upload-form').reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);    } catch (err) {
      console.error('Error uploading document:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = 'Error al subir el documento';
      
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          // Handle validation errors
          const validationErrors = Object.values(err.response.data.errors).flat();
          errorMessage = validationErrors.join(', ');
        }
      }
      
      setUploadStatus({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleDownload = async (documentId, documentName) => {
    try {
      const response = await axios.get(`/employee/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Error al descargar el documento');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }
    
    try {
      await axios.delete(`/employee/documents/${documentId}`);
      setUploadStatus({
        type: 'success',
        message: 'Documento eliminado con éxito',
      });
      fetchDocuments(); // Refresh documents list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting document:', err);
      setUploadStatus({
        type: 'error',
        message: 'Error al eliminar el documento',
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Documentos</h2>

      {/* Status messages */}
      {uploadStatus && (
        <div
          className={`p-4 mb-4 rounded-md ${
            uploadStatus.type === 'error'
              ? 'bg-red-50 text-red-800'
              : uploadStatus.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-blue-50 text-blue-800'
          }`}
        >
          <p className="text-sm font-medium">{uploadStatus.message}</p>
        </div>
      )}

      {/* Upload form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subir nuevo documento</h3>
        <form id="upload-form" onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="document-type" className="block text-sm font-medium text-gray-700">
              Tipo de documento
            </label>
            <select
              id="document-type"
              value={documentType}
              onChange={handleDocumentTypeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="document-file" className="block text-sm font-medium text-gray-700">
              Archivo (PDF, máx. 5MB)
            </label>
            <input
              type="file"
              id="document-file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={uploadStatus?.type === 'loading'}
            >
              {uploadStatus?.type === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : (
                'Subir documento'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Documents list */}
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
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay documentos subidos.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr key={document.document_id}>                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {document.file_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {documentTypes.find((type) => type.id === document.doc_type)?.name || document.doc_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(document.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(document.document_id, document.file_name)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Descargar
                      </button>
                      <button
                        onClick={() => handleDelete(document.document_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
