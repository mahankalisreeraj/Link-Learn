import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

import LandingPage from './pages/LandingPage';

// Simplified Protected Route
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Placeholder Home
const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Link & Learn</h1>
      <p className="text-gray-600 mb-8">Peer-to-peer learning platform</p>
      <div className="p-4 bg-white rounded shadow">
        <p className="text-green-600 font-medium">You are logged in!</p>
      </div>
    </div>
  </div>
);

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
      </Routes>
    </Router>
  );
}

export default App;
