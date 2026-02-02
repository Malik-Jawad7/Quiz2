// src/services/api.jsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== NAMED EXPORTS =====
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: `Backend server is not responding: ${error.message}`
    };
  }
};

export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response;
  } catch (error) {
    throw error;
  }
};

export const checkDashboardAccess = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status,
      message: error.message 
    };
  }
};

export const getAllQuestions = async () => {
  try {
    const response = await api.get('/admin/questions');
    return response;
  } catch (error) {
    throw error;
  }
};

export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/admin/questions', questionData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getResults = async () => {
  try {
    const response = await api.get('/admin/results');
    return response;
  } catch (error) {
    throw error;
  }
};

// ========== FIXED DELETE FUNCTIONS ==========
export const deleteResult = async (resultId) => {
  try {
    console.log(`🔍 Attempting to delete result: ${resultId}`);
    
    // Try multiple endpoint patterns for single delete
    const endpoints = [
      `/admin/results/${resultId}`,
      `/admin/result/${resultId}`,
      `/admin/results/delete/${resultId}`,
      `/api/results/${resultId}`,
      `/api/result/${resultId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const response = await api.delete(endpoint);
        console.log(`✅ Successfully deleted via ${endpoint}`);
        return response;
      } catch (endpointError) {
        if (endpointError.response?.status === 404) {
          console.log(`❌ Endpoint ${endpoint} returned 404`);
          continue; // Try next endpoint
        } else if (endpointError.response?.status === 401) {
          throw new Error('Unauthorized - Please login again');
        } else {
          console.log(`❌ Endpoint ${endpoint} error:`, endpointError.message);
        }
      }
    }
    
    // If all endpoints fail, try POST method
    console.log('🔄 Trying POST method for deletion...');
    const postEndpoints = [
      `/admin/results/delete`,
      `/admin/result/delete`,
      `/api/results/delete`
    ];
    
    for (const endpoint of postEndpoints) {
      try {
        const response = await api.post(endpoint, { resultId });
        console.log(`✅ Successfully deleted via POST ${endpoint}`);
        return response;
      } catch (postError) {
        console.log(`❌ POST endpoint ${endpoint} failed:`, postError.message);
      }
    }
    
    // Ultimate fallback - use GET to trigger deletion (if backend has GET delete endpoint)
    console.log('🔄 Trying GET method as last resort...');
    try {
      const response = await api.get(`/admin/results/delete/${resultId}`);
      console.log('✅ Successfully deleted via GET');
      return response;
    } catch (getError) {
      console.log('❌ GET method also failed:', getError.message);
    }
    
    // If everything fails, throw error
    throw new Error('No delete endpoint found. Please add proper backend API.');
    
  } catch (error) {
    console.error('❌ All delete methods failed:', error.message);
    throw error;
  }
};

export const deleteAllResults = async () => {
  try {
    console.log('🔍 Attempting to delete ALL results');
    
    // Try multiple endpoint patterns for delete all
    const endpoints = [
      '/admin/results',
      '/admin/results/all',
      '/admin/results/delete-all',
      '/admin/delete-results',
      '/api/results/all',
      '/api/delete-results'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const response = await api.delete(endpoint);
        console.log(`✅ Successfully deleted all via ${endpoint}`);
        return response;
      } catch (endpointError) {
        if (endpointError.response?.status === 404) {
          console.log(`❌ Endpoint ${endpoint} returned 404`);
          continue; // Try next endpoint
        } else if (endpointError.response?.status === 401) {
          throw new Error('Unauthorized - Please login again');
        } else {
          console.log(`❌ Endpoint ${endpoint} error:`, endpointError.message);
        }
      }
    }
    
    // Try POST method
    console.log('🔄 Trying POST method for delete all...');
    const postEndpoints = [
      '/admin/results/delete-all',
      '/admin/delete-all-results',
      '/api/results/delete-all'
    ];
    
    for (const endpoint of postEndpoints) {
      try {
        const response = await api.post(endpoint);
        console.log(`✅ Successfully deleted all via POST ${endpoint}`);
        return response;
      } catch (postError) {
        console.log(`❌ POST endpoint ${endpoint} failed:`, postError.message);
      }
    }
    
    // Try GET method as last resort
    console.log('🔄 Trying GET method as last resort...');
    try {
      const response = await api.get('/admin/results/delete-all');
      console.log('✅ Successfully deleted all via GET');
      return response;
    } catch (getError) {
      console.log('❌ GET method also failed:', getError.message);
    }
    
    throw new Error('No delete all endpoint found. Please add proper backend API.');
    
  } catch (error) {
    console.error('❌ All delete all methods failed:', error.message);
    throw error;
  }
};
// ========== END FIXED DELETE FUNCTIONS ==========

export const getConfig = async () => {
  try {
    const response = await api.get('/config');
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/config', configData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAvailableCategories = async () => {
  try {
    const response = await api.get('/available-categories');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCategoryStats = async () => {
  try {
    const response = await api.get('/category-stats');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getQuizQuestions = async (category) => {
  try {
    const response = await api.get(`/quiz/questions/${category}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/quiz/submit', quizData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const setupAdmin = async () => {
  try {
    const response = await api.get('/setup-admin');
    return response;
  } catch (error) {
    throw error;
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const testEndpoints = async () => {
  console.log('🔍 Testing available endpoints...');
  const testEndpoints = [
    '/admin/results',
    '/admin/result',
    '/admin/results/all',
    '/admin/delete-results',
    '/admin/results/delete-all',
    '/api/results',
    '/api/result'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      await api.get(endpoint);
      console.log(`✅ GET ${endpoint} - EXISTS`);
    } catch (error) {
      console.log(`❌ GET ${endpoint} - ${error.response?.status || 'Error'}`);
    }
  }
};

// Optional: Also export as default for backward compatibility
const apiService = {
  healthCheck,
  adminLogin,
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
  getAvailableCategories,
  getCategoryStats,
  getQuizQuestions,
  submitQuiz,
  registerUser,
  setupAdmin,
  adminLogout,
  testEndpoints
};

export default apiService;