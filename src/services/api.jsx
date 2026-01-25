// src/services/api.jsx
import axios from 'axios';

// Base URL
const API_URL = 'http://localhost:5000/api';

// ========== PUBLIC ROUTES ==========

// Register User
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Get questions by category
export const getQuestionsByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_URL}/user/questions/${category}`);
        return response;
    } catch (error) {
        console.error('Get questions error:', error);
        throw error;
    }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
    try {
        const response = await axios.post(`${API_URL}/user/submit`, quizData);
        return response;
    } catch (error) {
        console.error('Submit quiz error:', error);
        throw error;
    }
};

// Get config (public)
export const getQuizConfig = async () => {
    try {
        const response = await axios.get(`${API_URL}/config`);
        return response;
    } catch (error) {
        console.log('Failed to fetch config, using fallback');
        // Return mock data as fallback
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

// Get configuration for result page (public - no token required)
export const getResultConfig = async () => {
    try {
        const response = await axios.get(`${API_URL}/config/public`);
        return response;
    } catch (error) {
        console.log('Failed to fetch result config, using fallback', error);
        // Return fallback data
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

// ========== ADMIN ROUTES ==========

// Admin login
export const adminLogin = async (loginData) => {
    try {
        const response = await axios.post(`${API_URL}/admin/login`, loginData);
        return response;
    } catch (error) {
        console.error('Admin login error:', error);
        throw error;
    }
};

// Get config (admin)
export const getConfig = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_URL}/admin/config`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Get config error, returning fallback:', error);
        // Return fallback data
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

// Update config - use PUT method
export const updateConfig = async (configData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.put(`${API_URL}/admin/config`, configData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Update config error:', error);
        throw error;
    }
};

// Get all questions
export const getAllQuestions = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_URL}/admin/questions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Get all questions error:', error);
        return {
            data: {
                success: true,
                questions: []
            }
        };
    }
};

// Add questions
export const addQuestions = async (questionData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.post(`${API_URL}/admin/questions`, questionData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Add questions error:', error);
        throw error;
    }
};

// Update question
export const updateQuestion = async (id, questionData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.put(`${API_URL}/admin/questions/${id}`, questionData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Update question error:', error);
        throw error;
    }
};

// Delete question
export const deleteQuestion = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.delete(`${API_URL}/admin/questions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Delete question error:', error);
        throw error;
    }
};

// Get results
export const getResults = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_URL}/admin/results`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Get results error:', error);
        return {
            data: {
                success: true,
                results: []
            }
        };
    }
};

// Add result (admin) - NEW FUNCTION ADDED
export const addResult = async (resultData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.post(`${API_URL}/admin/results`, resultData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Add result error:', error);
        throw error;
    }
};

// Delete result
export const deleteResult = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.delete(`${API_URL}/admin/results/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Delete result error:', error);
        throw error;
    }
};

// Delete all results
export const deleteAllResults = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.delete(`${API_URL}/admin/results`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Delete all results error:', error);
        throw error;
    }
};

// Get dashboard stats
export const getDashboardStats = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Get dashboard stats error, returning fallback:', error);
        // Return fallback data
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