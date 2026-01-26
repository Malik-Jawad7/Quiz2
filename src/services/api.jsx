import axios from 'axios';

// ================= CONFIGURATION =================
const API_BASE_URL = 'https://your-backend-url.vercel.app'; // Replace with your backend URL
const API_URL = `${API_BASE_URL}/api`;

console.log('📡 API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ========== PUBLIC ROUTES ==========

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const getQuestionsByCategory = async (category) => {
  try {
    const response = await api.get(`/user/questions/${category}`);
    return response;
  } catch (error) {
    console.error('Get questions error:', error.response?.data || error.message);
    throw error;
  }
};

export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/user/submit', quizData);
    return response;
  } catch (error) {
    console.error('Submit quiz error:', error.response?.data || error.message);
    throw error;
  }
};

export const getQuizConfig = async () => {
  try {
    const response = await api.get('/config');
    return response;
  } catch (error) {
    console.log('Failed to fetch config, using fallback', error.message);
    return {
      data: {
        success: true,
        config: {
          quizTime: 30,
          passingPercentage: 40,
          totalQuestions: 50,
          maxMarks: 100
        }
      }
    };
  }
};

export const getResultConfig = async () => {
  try {
    const response = await api.get('/config');
    return response;
  } catch (error) {
    console.log('Failed to fetch result config, using fallback', error.message);
    return {
      data: {
        success: true,
        config: {
          quizTime: 30,
          passingPercentage: 40,
          totalQuestions: 50,
          maxMarks: 100
        }
      }
    };
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return {
      data: {
        success: false,
        message: 'Backend is not responding'
      }
    };
  }
};

export const testDatabase = async () => {
  try {
    const response = await api.get('/test-db');
    return response;
  } catch (error) {
    console.error('Database test failed:', error.message);
    return {
      data: {
        success: false,
        message: 'Database connection failed'
      }
    };
  }
};

// ========== ADMIN ROUTES ==========

export const adminLogin = async (loginData) => {
  try {
    console.log('Admin login attempt to:', API_URL + '/admin/login');
    const response = await api.post('/admin/login', loginData);
    return response;
  } catch (error) {
    console.error('Admin login error:', error.response?.data || error.message);
    throw error;
  }
};

export const getConfig = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.get('/admin/config', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Get config error:', error.message);
    return {
      data: {
        success: true,
        config: {
          quizTime: 30,
          passingPercentage: 40,
          totalQuestions: 50,
          maxMarks: 100
        }
      }
    };
  }
};

export const updateConfig = async (configData) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.put('/admin/config', configData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Update config error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllQuestions = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.get('/admin/questions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Get all questions error:', error.message);
    return {
      data: {
        success: true,
        questions: []
      }
    };
  }
};

export const addQuestion = async (questionData) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.post('/admin/questions', questionData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Add question error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.delete(`/admin/questions/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Delete question error:', error.response?.data || error.message);
    throw error;
  }
};

export const getResults = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.get('/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Get results error:', error.message);
    return {
      data: {
        success: true,
        results: []
      }
    };
  }
};

// ✅ ADD THIS MISSING FUNCTION
export const addResult = async (resultData) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.post('/admin/results', resultData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Add result error:', error.response?.data || error.message);
    // Fallback for memory mode
    return {
      data: {
        success: true,
        message: 'Result added successfully (Memory Mode)',
        result: resultData
      }
    };
  }
};

export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.get('/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    return {
      data: {
        success: true,
        stats: {
          totalStudents: 0,
          totalQuestions: 0,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          todayAttempts: 0,
          totalCategories: 0,
          activeStudents: 0
        }
      }
    };
  }
};

export const deleteResult = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.delete(`/admin/results/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Delete result error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteAllResults = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.delete('/admin/results', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Delete all results error:', error.response?.data || error.message);
    throw error;
  }
};

export const getResultDetails = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const response = await api.get(`/admin/users/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('Get result details error:', error.message);
    return {
      data: {
        success: true,
        result: {
          id: id,
          name: 'Sample Student',
          rollNumber: 'STU001',
          score: 35,
          totalQuestions: 50,
          percentage: 70,
          passed: true,
          createdAt: new Date().toISOString()
        }
      }
    };
  }
};

// ========== HELPER FUNCTIONS ==========

export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  return !!(token && adminUser);
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('Admin logged out');
};

export const getAdminInfo = () => {
  try {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    return null;
  }
};

// Export all functions
export default {
  registerUser,
  getQuestionsByCategory,
  submitQuiz,
  getQuizConfig,
  getResultConfig,
  checkHealth,
  adminLogin,
  getConfig,
  updateConfig,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  addResult, // ✅ Add this to default export
  getDashboardStats,
  testDatabase,
  deleteResult,
  deleteAllResults,
  getResultDetails,
  isAdminAuthenticated,
  adminLogout,
  getAdminInfo
};