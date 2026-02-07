import axios from 'axios';

// API Configuration
const getApiBaseUrl = () => {
  // Development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Production - YOUR VERCEL BACKEND URL
  return 'https://backend-5zyvqsnhttltnpqwf1bcf963r5bv.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
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

// ==================== API FUNCTIONS ====================

// Test server connection
export const testServerConnection = async () => {
  try {
    console.log('🔍 Testing connection to:', API_BASE_URL);
    
    const response = await api.get('/api/health');
    
    return {
      success: true,
      data: response.data,
      url: API_BASE_URL,
      message: 'Server connected successfully',
      database: response.data.database || 'unknown'
    };
    
  } catch (error) {
    console.error('Server connection failed:', error.message);
    
    return {
      success: false,
      message: 'Cannot connect to server',
      url: API_BASE_URL,
      error: error.message
    };
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', {
      username: credentials.username || 'admin',
      password: credentials.password || 'admin123'
    });
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      return response.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback for offline testing
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const fallbackToken = 'fallback_token_' + Date.now();
      localStorage.setItem('adminToken', fallbackToken);
      
      return {
        success: true,
        message: 'Login successful (offline mode)',
        token: fallbackToken,
        user: { username: 'admin' }
      };
    }
    
    throw new Error(error.response?.data?.message || 'Login failed. Use: admin / admin123');
  }
};

// Get config
export const getConfig = async () => {
  try {
    const response = await api.get('/api/config');
    return response.data;
  } catch (error) {
    console.error('Get config error:', error);
    return {
      success: false,
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
    const response = await api.put('/api/config', configData);
    return response.data;
  } catch (error) {
    console.error('Update config error:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error);
    return {
      success: false,
      categories: [
        { value: 'html', label: 'HTML', available: true },
        { value: 'css', label: 'CSS', available: true },
        { value: 'javascript', label: 'JavaScript', available: true }
      ]
    };
  }
};

// Get quiz questions
export const getQuizQuestions = async (category) => {
  try {
    const response = await api.get(`/api/quiz/questions/${category}`);
    return response.data;
  } catch (error) {
    console.error('Get quiz questions error:', error);
    throw error;
  }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/api/quiz/submit', quizData);
    return response.data;
  } catch (error) {
    console.error('Submit quiz error:', error);
    
    // Local fallback
    const totalQuestions = quizData.totalQuestions || 1;
    const correctAnswers = quizData.correctAnswers || 0;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    return {
      success: false,
      message: 'Submitted locally',
      result: {
        rollNumber: quizData.rollNumber || '',
        name: quizData.name || '',
        category: quizData.category || '',
        score: correctAnswers,
        percentage: parseFloat(percentage.toFixed(2)),
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        passingPercentage: quizData.passingPercentage || 40,
        passed: percentage >= (quizData.passingPercentage || 40),
        submittedAt: new Date().toISOString()
      }
    };
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
};

// Get all questions
export const getAllQuestions = async (category = 'all', search = '', page = 1, limit = 100) => {
  try {
    const response = await api.get('/api/admin/questions', {
      params: { category, search, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get questions error:', error);
    throw error;
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/api/admin/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('Add question error:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Delete question error:', error);
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    const response = await api.get('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('Get results error:', error);
    throw error;
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/api/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('Delete result error:', error);
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('Delete all results error:', error);
    throw error;
  }
};

// Reset admin
export const resetAdmin = async () => {
  try {
    const response = await api.post('/admin/reset');
    return response.data;
  } catch (error) {
    console.error('Reset admin error:', error);
    throw error;
  }
};

// Admin logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
};

// Export all
const apiService = {
  testServerConnection,
  adminLogin,
  getConfig,
  updateConfig,
  getCategories,
  getQuizQuestions,
  submitQuiz,
  registerUser,
  getDashboardStats,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  deleteResult,
  deleteAllResults,
  resetAdmin,
  adminLogout
};

export default apiService;