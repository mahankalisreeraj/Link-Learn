import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

import LandingPage from './pages/LandingPage';
import SessionRoom from './pages/SessionRoom';
import Profile from './pages/Profile';
import Discovery from './pages/Discovery';
import Dashboard from './pages/Dashboard';

// Simplified Protected Route
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:id"
          element={
            <ProtectedRoute>
              <SessionRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id?"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discovery"
          element={
            <Discovery />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
