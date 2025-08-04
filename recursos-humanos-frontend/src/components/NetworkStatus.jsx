import { useState, useEffect } from 'react';
import api from '../services/api';

const NetworkStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Comprobando conexión con el servidor...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get('/health');
        setStatus('connected');
        setMessage('Conectado al servidor correctamente');
        setDetails({
          serverTime: response.data.timestamp,
          status: response.data.status
        });
      } catch (error) {
        setStatus('error');
        
        if (error.response) {
          // El servidor respondió con un código de error
          setMessage(`Error en la respuesta del servidor: ${error.response.status}`);
          setDetails({
            status: error.response.status,
            data: error.response.data
          });
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          setMessage('No se recibió respuesta del servidor. Verifique que el servidor esté en ejecución.');
          setDetails({
            message: 'Network Error - No response',
            request: error.request.toString()
          });
        } else {
          // Algo sucedió al configurar la solicitud
          setMessage(`Error de configuración: ${error.message}`);
          setDetails({
            message: error.message
          });
        }
      }
    };

    checkConnection();
    
    // Verificar la conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg ${
      status === 'connected' ? 'bg-green-100' : 
      status === 'error' ? 'bg-red-100' : 'bg-yellow-100'
    }`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          status === 'connected' ? 'bg-green-500' :
          status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
        <span className="text-sm font-medium">{message}</span>
      </div>
      {details && (
        <button 
          className="text-xs text-blue-500 mt-1" 
          onClick={() => console.log('Detalles de conexión:', details)}
        >
          Ver detalles en consola
        </button>
      )}
    </div>
  );
};

export default NetworkStatus;
