import axios from 'axios';

// Backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.message);
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

// Test server connection
export const testServerConnection = async () => {
  try {
    const response = await api.get('/health');
    return { 
      success: true, 
      data: response.data,
      url: API_BASE_URL
    };
  } catch (error) {
    console.error('Server connection failed:', error);
    return { 
      success: false, 
      message: error.message || 'API connection failed',
      url: API_BASE_URL
    };
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || {}));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Show specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

// Check dashboard access
export const checkDashboardAccess = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      return { 
        success: false, 
        message: 'No token found. Please login.' 
      };
    }
    
    // Try to get dashboard stats to verify token
    const response = await api.get('/admin/dashboard');
    return { 
      success: response.data.success, 
      data: response.data
    };
  } catch (error) {
    console.error('Access check error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Access check failed'
    };
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
};

// Get all questions
export const getAllQuestions = async (category = 'all') => {
  try {
    const response = await api.get(`/admin/questions?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Get questions error:', error);
    throw error;
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    console.log('Sending question to server:', questionData);
    
    const response = await api.post('/admin/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('Add question error:', error);
    
    // Show specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.message?.includes('Network Error')) {
      throw new Error('Cannot connect to server. Please make sure backend is running on port 5000.');
    }
    
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Delete question error:', error);
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    const response = await api.get('/admin/results');
    return response.data;
  } catch (error) {
    console.error('Get results error:', error);
    throw error;
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('Delete result error:', error);
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/admin/results');
    return response.data;
  } catch (error) {
    console.error('Delete all results error:', error);
    throw error;
  }
};

// Get config
export const getConfig = async () => {
  try {
    const response = await api.get('/config');
    return response.data;
  } catch (error) {
    console.error('Get config error:', error);
    
    // Return default config if API fails
    return {
      success: true,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      }
    };
  }
};

// Update config
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/config', configData);
    return response.data;
  } catch (error) {
    console.error('Update config error:', error);
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
      categories: []
    };
  }
};

// Get quiz questions
export const getQuizQuestions = async (category) => {
  try {
    console.log('Fetching questions for category:', category);
    
    const response = await api.get(`/quiz/questions/${category}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get questions');
    }
    
    if (!response.data.questions || response.data.questions.length === 0) {
      throw new Error('No questions available for this category');
    }
    
    console.log('Questions received from database:', response.data.questions.length);
    return response.data;
  } catch (error) {
    console.error('Get quiz questions error:', error);
    
    // If it's a 404 error, throw a specific message
    if (error.response?.status === 404) {
      throw new Error('No questions available for this category. Please ask administrator to add questions first.');
    }
    
    throw error;
  }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/quiz/submit', quizData);
    return response.data;
  } catch (error) {
    console.error('Submit quiz error:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', userData);
    
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    
    // Show specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

// Get registrations (for admin)
export const getRegistrations = async () => {
  try {
    const response = await api.get('/admin/registrations');
    return response.data;
  } catch (error) {
    console.error('Get registrations error:', error);
    throw error;
  }
};

// Initialize database
export const initDatabase = async () => {
  try {
    const response = await api.get('/init-db');
    return response.data;
  } catch (error) {
    console.error('Init database error:', error);
    throw error;
  }
};

// Admin logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Redirect to login
  setTimeout(() => {
    window.location.href = '/admin/login';
  }, 500);
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
  initDatabase,
  registerUser,
  getRegistrations,
  adminLogout
};

export default apiService;