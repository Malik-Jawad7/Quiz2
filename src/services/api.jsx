import axios from 'axios';

// Production Backend URL
const API_BASE_URL = 'https://backend-one-taupe-14.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
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
    
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
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

// Test server connection
export const testServerConnection = async () => {
  try {
    console.log('🔗 Testing server connection to:', API_BASE_URL);
    const response = await api.get('/health');
    
    return { 
      success: true, 
      data: response.data,
      url: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    
    return { 
      success: false, 
      message: `API connection failed: ${error.message}`,
      url: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    console.log('🔐 Attempting admin login...');
    const response = await api.post('/admin/login', credentials);
    
    if (response.data.success) {
      console.log('✅ Login successful');
      // Save token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Get Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('❌ Dashboard error:', error);
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
    console.error('❌ Get questions error:', error);
    throw error;
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/admin/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('❌ Add question error:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete question error:', error);
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    const response = await api.get('/admin/results');
    return response.data;
  } catch (error) {
    console.error('❌ Get results error:', error);
    throw error;
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete result error:', error);
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/admin/results');
    return response.data;
  } catch (error) {
    console.error('❌ Delete all results error:', error);
    throw error;
  }
};

// Get config
export const getConfig = async () => {
  try {
    const response = await api.get('/config');
    return response.data;
  } catch (error) {
    console.error('❌ Get config error:', error);
    throw error;
  }
};

// Update config
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/config', configData);
    return response.data;
  } catch (error) {
    console.error('❌ Update config error:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('❌ Get categories error:', error);
    // Return default categories if API fails
    return {
      success: true,
      categories: [
        { value: 'html', label: 'HTML', description: 'HyperText Markup Language', questionCount: 10 },
        { value: 'css', label: 'CSS', description: 'Cascading Style Sheets', questionCount: 10 },
        { value: 'javascript', label: 'JavaScript', description: 'Programming Language', questionCount: 10 },
        { value: 'react', label: 'React', description: 'JavaScript Library', questionCount: 10 },
        { value: 'node', label: 'Node.js', description: 'JavaScript Runtime', questionCount: 10 },
        { value: 'java', label: 'Java', description: 'Programming Language', questionCount: 10 },
        { value: 'python', label: 'Python', description: 'Programming Language', questionCount: 10 },
        { value: 'general', label: 'General Technology', description: 'General IT Knowledge', questionCount: 10 }
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
    console.error('❌ Get quiz questions error:', error);
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
    console.error('❌ Submit quiz error:', error);
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
    console.error('❌ Init database error:', error);
    throw error;
  }
};

// User registration
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
  registerUser
};

export default apiService;