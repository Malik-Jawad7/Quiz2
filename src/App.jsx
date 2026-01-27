import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import './App.css';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Protected Route Component for Quiz
const QuizRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  const category = localStorage.getItem('category');
  
  if (!userId || !category) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Component
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Register />} />
          <Route path="/quiz" element={
            <QuizRoute>
              <Quiz />
            </QuizRoute>
          } />
          <Route path="/result" element={<Result />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Routes */}
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          {/* Catch-all Route - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;