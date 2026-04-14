import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddAsset from './pages/AddAsset';
import AuditLog from './pages/AuditLog';
import AccessControl from './pages/AccessControl';
import Layout from './components/Layout';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
          <Route path="/add-asset" element={<ProtectedRoute><Layout><AddAsset /></Layout></ProtectedRoute>} />
          <Route path="/audit" element={<AdminRoute><Layout><AuditLog /></Layout></AdminRoute>} />
          <Route path="/access" element={<AdminRoute><Layout><AccessControl /></Layout></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
