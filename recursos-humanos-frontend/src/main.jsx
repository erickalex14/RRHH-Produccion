import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Añadir información de depuración sobre el entorno
console.log('Información del entorno:');
console.log('URL de la API:', import.meta.env.VITE_API_URL || '/api');
console.log('Modo:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('Versión de la aplicación:', import.meta.env.VITE_APP_VERSION || '1.0.0');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
