import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cows from './pages/Cows';
import Tasks from './pages/Tasks';
import Sheds from './pages/Sheds';
import Admin from './pages/Admin';
import Health from './pages/Health';
import Inventory from './pages/Inventory';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes using Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cows" element={<Cows />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="sheds" element={<Sheds />} />
          <Route path="admin" element={<Admin />} />
          <Route path="health" element={<Health />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
