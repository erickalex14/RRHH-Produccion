import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import router from './router'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import NetworkStatus from './components/NetworkStatus'

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
        <RouterProvider router={router} />
        <NetworkStatus />
      </Suspense>
    </AuthProvider>
  )
}

export default App
