// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
// import Home from './pages/Home'; // Remove this import
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/register" />} /> {/* Change this */}
          <Route path="/register" element={<Register />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result/:rollNumber" element={<Result />} />
          <Route path="/result" element={<Result />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
          
          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/register" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;