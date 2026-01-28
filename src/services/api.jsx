// src/services/api.jsx
import axios from 'axios';

// Temporary: Local backend use karein
const API_URL = 'http://localhost:5000/api';

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
    const response = await axiosInstance.post('/admin/login', loginData);
    if (response.data.success) {
      localStorage.setItem('adminToken', 'admin-token');
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
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
    console.error('Error fetching categories:', error);
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

// ==================== QUESTION MANAGEMENT ====================
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

export const updateQuestion = async (id, questionData) => {
  try {
    const response = await axiosInstance.put(`/admin/questions/${id}`, questionData);
    return response;
  } catch (error) {
    console.error('Error updating question:', error);
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

// ✅ THIS WAS MISSING - Add this function
export const deleteAllQuestions = async () => {
  try {
    const response = await axiosInstance.delete('/admin/questions?confirm=true');
    return response;
  } catch (error) {
    console.error('Error deleting all questions:', error);
    throw error;
  }
};

// ==================== RESULT MANAGEMENT ====================
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

// ✅ THIS WAS MISSING - Add this function
export const deleteAllResults = async () => {
  try {
    const response = await axiosInstance.delete('/admin/results?confirm=true');
    return response;
  } catch (error) {
    console.error('Error deleting all results:', error);
    throw error;
  }
};

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { success: false, message: 'Backend server is not responding' };
  }
};

// ✅ THIS WAS MISSING - Add this function (Frontend-only CSV export)
export const exportQuestionsToCSV = async (questions = []) => {
  return new Promise((resolve) => {
    try {
      if (!questions || questions.length === 0) {
        alert('No questions to export');
        resolve({ data: { success: false, message: 'No questions to export' } });
        return;
      }

      const csvContent = [
        [
          'Category',
          'Question',
          'Option A',
          'Option B',
          'Option C',
          'Option D',
          'Correct Answer',
          'Marks',
          'Difficulty',
        ],
        ...questions.map((q) => {
          const correctIndex = q.options ? q.options.findIndex((opt) => opt.isCorrect) : -1;
          const correctAnswer = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : 'N/A';
          
          return [
            q.category,
            q.questionText,
            q.options && q.options[0] ? q.options[0].text : '',
            q.options && q.options[1] ? q.options[1].text : '',
            q.options && q.options[2] ? q.options[2].text : '',
            q.options && q.options[3] ? q.options[3].text : '',
            correctAnswer,
            q.marks || 1,
            q.difficulty || 'medium',
          ];
        }),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shamsi-questions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      resolve({ data: { success: true, message: 'Questions exported successfully' } });
    } catch (error) {
      console.error('Error exporting questions:', error);
      resolve({ data: { success: false, message: 'Error exporting questions' } });
    }
  });
};

// ✅ THIS FUNCTION IS NOT NEEDED BUT KEEPING FOR COMPATIBILITY
export const exportResultsToCSV = () => {
  console.warn('exportResultsToCSV not implemented - use exportQuestionsToCSV instead');
  return Promise.resolve({ data: { success: false, message: 'Not implemented' } });
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
  updateQuestion,
  deleteQuestion,
  deleteAllQuestions,
  
  // Result Management
  getResults,
  deleteResult,
  deleteAllResults,
  
  // Dashboard
  getDashboardStats,
  
  // Utility
  healthCheck,
  exportQuestionsToCSV,
  exportResultsToCSV,
  testBackendConnection,
};

export default apiService;