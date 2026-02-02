import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

import LandingPage from './pages/LandingPage';
import SessionRoom from './pages/SessionRoom';

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
              <Layout title="Dashboard">
                {/* Dashboard Content - Placeholder or existing text */}
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to your Dashboard</h2>
                  <p className="text-slate-500">Your learning journey begins here.</p>
                </div>
              </Layout>
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
      </Routes>
    </Router>
  );
}

export default App;
