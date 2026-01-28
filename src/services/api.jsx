// api.js - Updated for Vercel deployment
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-one-taupe-14.vercel.app/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config.url);
      return Promise.reject(new Error('Request timeout. Please check your internet connection.'));
    }
    
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }
    
    return Promise.reject(error);
  }
);

// ==================== QUIZ APIs ====================
export const getQuizQuestions = async (category) => {
  try {
    console.log(`Fetching questions for category: ${category}`);
    const response = await axiosInstance.get(`/quiz/questions/${category}`);
    return response;
  } catch (error) {
    console.error('Error fetching quiz questions:', error.response?.data || error.message);
    throw error;
  }
};

export const submitQuiz = async (quizData) => {
  try {
    const response = await axiosInstance.post('/quiz/submit', quizData);
    return response;
  } catch (error) {
    console.error('Error submitting quiz:', error.response?.data || error.message);
    throw error;
  }
};

export const getResult = async (rollNumber) => {
  try {
    const response = await axiosInstance.get(`/result/${rollNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching result:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== ADMIN APIs ====================
export const adminLogin = async (loginData) => {
  try {
    console.log('Attempting admin login with:', loginData);
    const response = await axiosInstance.post('/admin/login', loginData);
    
    if (response.data.success) {
      localStorage.setItem('adminToken', 'dummy-token-for-auth');
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error.response?.data || error.message);
    throw error;
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

export const getAdminInfo = () => {
  try {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    return null;
  }
};

export const getAvailableCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw error;
  }
};

export const getConfig = async () => {
  try {
    const response = await axiosInstance.get('/config');
    return response;
  } catch (error) {
    console.error('Error fetching config:', error.response?.data || error.message);
    throw error;
  }
};

export const updateConfig = async (configData) => {
  try {
    const response = await axiosInstance.put('/config', configData);
    return response;
  } catch (error) {
    console.error('Error updating config:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== QUESTION MANAGEMENT ====================
export const getAllQuestions = async () => {
  try {
    const response = await axiosInstance.get('/admin/questions');
    return response;
  } catch (error) {
    console.error('Error fetching questions:', error.response?.data || error.message);
    throw error;
  }
};

export const addQuestion = async (questionData) => {
  try {
    const response = await axiosInstance.post('/admin/questions', questionData);
    return response;
  } catch (error) {
    console.error('Error adding question:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await axiosInstance.delete(`/admin/questions/${questionId}`);
    return response;
  } catch (error) {
    console.error('Error deleting question:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== RESULT MANAGEMENT ====================
export const getResults = async () => {
  try {
    const response = await axiosInstance.get('/admin/results');
    return response;
  } catch (error) {
    console.error('Error fetching results:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteResult = async (resultId) => {
  try {
    const response = await axiosInstance.delete(`/admin/results/${resultId}`);
    return response;
  } catch (error) {
    console.error('Error deleting result:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return { 
      success: false, 
      message: 'Backend server is not responding',
      error: error.message 
    };
  }
};

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const health = await healthCheck();
    const categories = await getAvailableCategories();
    
    return {
      success: true,
      health,
      categories: categories.data,
      apiUrl: API_URL
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to backend',
      error: error.message,
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
  registerUser,
  
  // Admin APIs
  adminLogin,
  adminLogout,
  isAdminAuthenticated,
  getAdminInfo,
  getAvailableCategories,
  getConfig,
  updateConfig,
  
  // Question Management
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  
  // Result Management
  getResults,
  deleteResult,
  
  // Dashboard
  getDashboardStats,
  
  // Utility
  healthCheck,
  testBackendConnection,
};

export default apiService;