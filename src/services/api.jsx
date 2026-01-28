// src/services/api.jsx
import axios from 'axios';

// Production Backend URL
const API_URL = 'https://backend-one-taupe-14.vercel.app/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== QUIZ APIs ====================
export const getQuizQuestions = async (category) => {
  try {
    const response = await axiosInstance.get(`/quiz/questions/${category}`);
    return response;
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }
};

export const submitQuiz = async (quizData) => {
  try {
    const response = await axiosInstance.post('/quiz/submit', quizData);
    return response;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const getResult = async (rollNumber) => {
  try {
    const response = await axiosInstance.get(`/result/${rollNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching result:', error);
    throw error;
  }
};

// ✅ ADD THIS - This was missing
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// ==================== ADMIN APIs ====================
export const adminLogin = async (loginData) => {
  try {
    console.log('Sending login request to:', `${API_URL}/admin/login`);
    const response = await axiosInstance.post('/admin/login', loginData);
    
    if (response.data.success) {
      localStorage.setItem('adminToken', 'admin-auth-token');
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error.message);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

export const getConfig = async () => {
  try {
    const response = await axiosInstance.get('/config');
    return response;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
};

export const updateConfig = async (configData) => {
  try {
    const response = await axiosInstance.put('/config', configData);
    return response;
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
};

export const getAvailableCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getAllQuestions = async () => {
  try {
    const response = await axiosInstance.get('/admin/questions');
    return response;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const addQuestion = async (questionData) => {
  try {
    const response = await axiosInstance.post('/admin/questions', questionData);
    return response;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await axiosInstance.delete(`/admin/questions/${questionId}`);
    return response;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

export const deleteAllQuestions = async () => {
  try {
    const response = await axiosInstance.delete('/admin/questions?confirm=true');
    return response;
  } catch (error) {
    console.error('Error deleting all questions:', error);
    throw error;
  }
};

export const getResults = async () => {
  try {
    const response = await axiosInstance.get('/admin/results');
    return response;
  } catch (error) {
    console.error('Error fetching results:', error);
    throw error;
  }
};

export const deleteResult = async (resultId) => {
  try {
    const response = await axiosInstance.delete(`/admin/results/${resultId}`);
    return response;
  } catch (error) {
    console.error('Error deleting result:', error);
    throw error;
  }
};

export const deleteAllResults = async () => {
  try {
    const response = await axiosInstance.delete('/admin/results?confirm=true');
    return response;
  } catch (error) {
    console.error('Error deleting all results:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const exportQuestionsToCSV = () => {
  return Promise.resolve({ data: { success: true, message: 'Feature coming soon' } });
};

// Test API connection
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      success: false, 
      message: 'Backend server is not responding',
      apiUrl: API_URL
    };
  }
};

// ==================== DEFAULT EXPORT ====================
const apiService = {
  // Quiz APIs
  getQuizQuestions,
  submitQuiz,
  getResult,
  registerUser, // ✅ Added
  
  // Admin APIs
  adminLogin,
  getConfig,
  updateConfig,
  getAvailableCategories,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  deleteAllQuestions,
  getResults,
  deleteResult,
  deleteAllResults,
  getDashboardStats,
  adminLogout,
  exportQuestionsToCSV,
  healthCheck
};

export default apiService;