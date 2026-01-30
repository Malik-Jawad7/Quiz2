// src/services/api.js (or api.jsx)
import axios from 'axios';

const API_BASE_URL = 'https://backend-one-taupe-14.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN APIs ====================

// Health Check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: 'Backend server is not responding'
    };
  }
};

// Admin Login
export const adminLogin = (credentials) => {
  return api.post('/admin/login', credentials);
};

// Get Dashboard Stats
export const getDashboardStats = () => {
  return api.get('/admin/dashboard');
};

// Get All Questions
export const getAllQuestions = () => {
  return api.get('/admin/questions');
};

// Add Question
export const addQuestion = (questionData) => {
  return api.post('/admin/questions', questionData);
};

// Delete Question
export const deleteQuestion = (questionId) => {
  return api.delete(`/admin/questions/${questionId}`);
};

// Get Results
export const getResults = () => {
  return api.get('/admin/results');
};

// Delete Result
export const deleteResult = (resultId) => {
  return api.delete(`/admin/results/${resultId}`);
};

// Delete All Results - MISSING FUNCTION - ADD THIS
export const deleteAllResults = () => {
  return api.delete('/admin/results', { 
    params: { confirm: 'true' } 
  });
};

// Get Config
export const getConfig = () => {
  return api.get('/config');
};

// Update Config
export const updateConfig = (configData) => {
  return api.put('/config', configData);
};

// Admin Logout - MISSING FUNCTION - ADD THIS
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

// Get Result Details - MISSING FUNCTION - ADD THIS
export const getResultDetails = (resultId) => {
  return api.get(`/results/${resultId}`);
};

// Get Categories
export const getCategories = () => {
  return api.get('/categories');
};

// User Registration
export const registerUser = (userData) => {
  return api.post('/auth/register', userData);
};

// Get Quiz Questions
export const getQuizQuestions = (category) => {
  return api.get(`/quiz/questions/${category}`);
};

// Submit Quiz
export const submitQuiz = (quizData) => {
  return api.post('/quiz/submit', quizData);
};

// Quick Setup - MISSING FUNCTION - ADD THIS
export const quickSetup = () => {
  return api.get('/setup-admin');
};

// Setup Admin - MISSING FUNCTION - ADD THIS
export const setupAdmin = (adminData) => {
  return api.post('/admin/setup', adminData);
};

// Test Connection - MISSING FUNCTION - ADD THIS
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Default export
const apiService = {
  // Admin APIs
  healthCheck,
  adminLogin,
  getDashboardStats,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  deleteResult,
  deleteAllResults, // Add this
  adminLogout, // Add this
  
  // Config APIs
  getConfig,
  updateConfig,
  
  // Quiz APIs
  getCategories,
  getQuizQuestions,
  submitQuiz,
  registerUser,
  
  // Utility APIs
  quickSetup,
  setupAdmin,
  testConnection,
  getResultDetails // Add this
};

export default apiService;