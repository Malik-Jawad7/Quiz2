import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      config.headers['Authorization'] = `Bearer ${cleanToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      if (!window.location.pathname.includes('/admin/login')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

// Admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Test server connection
export const testServerConnection = async () => {
  try {
    const response = await api.get('/health');
    return { 
      success: true, 
      data: response.data
    };
  } catch (error) {
    return { 
      success: false, 
      message: `API connection failed: ${error.message}`
    };
  }
};

// Dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check dashboard access
export const checkDashboardAccess = async () => {
  try {
    const data = await getDashboardStats();
    return { 
      success: data.success, 
      data
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message
    };
  }
};

// Get all questions
export const getAllQuestions = async () => {
  try {
    const response = await api.get('/admin/questions');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/admin/questions', questionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    const response = await api.get('/admin/results');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/admin/results');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get config
export const getConfig = async () => {
  try {
    const response = await api.get('/config');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update config
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/config', configData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error);
    // Return default categories if API fails
    return {
      success: true,
      categories: [
        { value: 'html', label: 'HTML', description: 'HyperText Markup Language', questionCount: 10 },
        { value: 'css', label: 'CSS', description: 'Cascading Style Sheets', questionCount: 10 },
        { value: 'javascript', label: 'JavaScript', description: 'Programming Language', questionCount: 10 },
        { value: 'react', label: 'React', description: 'JavaScript Library', questionCount: 10 }
      ]
    };
  }
};

// Get quiz questions
export const getQuizQuestions = async (category) => {
  try {
    const response = await api.get(`/quiz/questions/${category}`);
    return response.data;
  } catch (error) {
    // Return empty questions if error
    return {
      success: true,
      questions: [],
      message: 'No questions available'
    };
  }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/quiz/submit', quizData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

// Initialize database
export const initDatabase = async () => {
  try {
    const response = await api.get('/init-db');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User registration - اضافہ کریں یہ فنکشن
export const registerUser = async (userData) => {
  try {
    console.log('👤 Registering user:', userData);
    
    // Mock response for now
    return {
      data: {
        success: true,
        message: 'User registered successfully',
        user: userData
      }
    };
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Return mock response
    return {
      data: {
        success: true,
        message: 'User registered successfully (Mock Mode)',
        user: userData
      }
    };
  }
};

const apiService = {
  adminLogin,
  testServerConnection,
  getDashboardStats,
  checkDashboardAccess,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  deleteResult,
  deleteAllResults,
  getConfig,
  updateConfig,
  getCategories,
  getQuizQuestions,
  submitQuiz,
  adminLogout,
  initDatabase,
  registerUser // یہاں اضافہ کریں
};

export default apiService;