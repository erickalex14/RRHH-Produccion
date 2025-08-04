import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Employee Pages
import ProfilePage from './pages/employee/ProfilePage';
import DocumentsPage from './pages/employee/DocumentsPage';
import AttendancePage from './pages/employee/AttendancePage';
import EmployeeEarlyDepartureRequestPage from './pages/employee/EarlyDepartureRequestPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import BranchesPage from './pages/admin/BranchesPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import RolesPage from './pages/admin/RolesPage';
import SchedulesPage from './pages/admin/SchedulesPage';
import EmployeeStatesPage from './pages/admin/EmployeeStatesPage';
import EarlyDepartureRequestPage from './pages/admin/EarlyDepartureRequestPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminAttendancePage from './pages/admin/AttendancePage';

// Error Pages
import NotFoundPage from './pages/NotFoundPage';

// Route Protection
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ]
  },
  {
    path: '/',
    index: true,
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [      {
        index: true,
        element: <Navigate to="/dashboard/admin" replace />,
      },
      // Employee routes
      {
        path: 'employee',
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/employee/profile" replace />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'documents',
            element: <DocumentsPage />,
          },          {
            path: 'attendance',
            element: <AttendancePage />,
          },
          {
            path: 'early-departure',
            element: <EmployeeEarlyDepartureRequestPage />,
          },
        ],
      },
      // Admin routes
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            ),
          },
          {
            path: 'companies',
            element: (
              <AdminRoute>
                <CompaniesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'branches',
            element: (
              <AdminRoute>
                <BranchesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'departments',
            element: (
              <AdminRoute>
                <DepartmentsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'roles',
            element: (
              <AdminRoute>
                <RolesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'schedules',
            element: (
              <AdminRoute>
                <SchedulesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'employee-states',
            element: (
              <AdminRoute>
                <EmployeeStatesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'early-departure',
            element: (
              <AdminRoute>
                <EarlyDepartureRequestPage />
              </AdminRoute>
            ),
          },
          {
            path: 'documents',
            element: (
              <AdminRoute>
                <AdminDocumentsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'attendance',
            element: (
              <AdminRoute>
                <AdminAttendancePage />
              </AdminRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
