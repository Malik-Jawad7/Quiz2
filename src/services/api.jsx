import axios from 'axios';

// Check current URL to determine environment
const getBaseURL = () => {
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // Development environment
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    if (currentPort === '5173') { // Vite default port
      return 'http://localhost:5000/api';
    }
    return 'http://localhost:5000/api';
  }
  
  // Production environment
  return 'https://quiz2-iota-one.vercel.app/api'; // Or your actual production URL
};

const API_URL = getBaseURL();

console.log(`🌐 API URL: ${API_URL}`);
console.log(`🌐 Current URL: ${window.location.href}`);

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN APIs ====================
export const adminLogin = async (loginData) => {
  try {
    const response = await axiosInstance.post('/admin/login', loginData);
    console.log('Login response:', response.data);
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
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
    const response = await axiosInstance.delete('/admin/results', { 
      params: { confirm: 'true' } 
    });
    return response;
  } catch (error) {
    console.error('Error deleting all results:', error);
    throw error;
  }
};

// ==================== CONFIG APIs ====================
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

// ==================== QUIZ APIs ====================
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

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

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get('/health');
    console.log('Health check response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      success: false, 
      message: 'Backend server is not responding'
    };
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const isUserRegistered = () => {
  return !!localStorage.getItem('userData');
};

export const clearUserData = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('quizCategory');
  localStorage.removeItem('quizRollNumber');
};

// For backward compatibility (temporary)
export const getAvailableCategories = getCategories;

// Default export
const apiService = {
  // Admin APIs
  adminLogin,
  getDashboardStats,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  deleteResult,
  deleteAllResults,
  adminLogout,
  
  // Config APIs
  getConfig,
  updateConfig,
  
  // Quiz APIs
  getCategories,
  getQuizQuestions,
  submitQuiz,
  registerUser,
  getUserData,
  isUserRegistered,
  clearUserData,
  
  // Utility
  healthCheck,
  
  // For backward compatibility
  getAvailableCategories
};

export default apiService;