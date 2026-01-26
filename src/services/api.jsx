// services/api.jsx (مکمل ورژن)
import axios from 'axios';

// ================= CONFIGURATION =================
const VERCEL_BACKEND_URL = 'https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app';

const API_URL = import.meta.env.PROD 
    ? `${VERCEL_BACKEND_URL}/api` 
    : 'http://localhost:5000/api';

console.log('📡 API URL:', API_URL);

// ========== PUBLIC ROUTES ==========

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
    }
};

export const getQuestionsByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_URL}/user/questions/${category}`, {
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Get questions error:', error.response?.data || error.message);
        throw error;
    }
};

export const submitQuiz = async (quizData) => {
    try {
        const response = await axios.post(`${API_URL}/user/submit`, quizData, {
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    } catch (error) {
        console.error('Submit quiz error:', error.response?.data || error.message);
        throw error;
    }
};

export const getQuizConfig = async () => {
    try {
        const response = await axios.get(`${API_URL}/config`, {
            timeout: 10000
        });
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
        const response = await axios.get(`${API_URL}/result-config`, {
            timeout: 10000
        });
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
        const response = await axios.get(`${API_URL}/health`, {
            timeout: 10000
        });
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

// ========== ADMIN ROUTES ==========

export const adminLogin = async (loginData) => {
    try {
        console.log('Admin login attempt to:', `${API_URL}/admin/login`);
        const response = await axios.post(`${API_URL}/admin/login`, loginData, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
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
        
        const response = await axios.get(`${API_URL}/admin/config`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
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
        
        const response = await axios.put(`${API_URL}/admin/config`, configData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
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
        
        const response = await axios.get(`${API_URL}/admin/questions`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 15000
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
        
        const response = await axios.post(`${API_URL}/admin/questions`, questionData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
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
        
        const response = await axios.delete(`${API_URL}/admin/questions/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
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
        
        const response = await axios.get(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 15000
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

// ✅ یہ function ضروری ہے AdminPanel.jsx کے لیے
export const addResult = async (resultData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.post(`${API_URL}/admin/results`, resultData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Add result error:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteResult = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.delete(`${API_URL}/admin/results/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
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
        
        const response = await axios.delete(`${API_URL}/admin/results`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Delete all results error:', error.response?.data || error.message);
        throw error;
    }
};

export const getDashboardStats = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 15000
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

export const testDatabase = async () => {
    try {
        const response = await axios.get(`${API_URL}/test-db`, {
            timeout: 15000
        });
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

export const initializeDatabase = async () => {
    try {
        const response = await axios.get(`${API_URL}/init`, {
            timeout: 20000
        });
        return response;
    } catch (error) {
        console.error('Initialize database error:', error.message);
        throw error;
    }
};

// ========== HELPER FUNCTIONS ==========

export const isAdminAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!token || !adminUser) {
        return false;
    }
    
    try {
        return true;
    } catch (error) {
        return false;
    }
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