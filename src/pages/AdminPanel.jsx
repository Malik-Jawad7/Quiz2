import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getConfig, 
    getResults, 
    getAllQuestions, 
    getDashboardStats, 
    addQuestions, 
    updateQuestion, 
    deleteQuestion, 
    deleteResult, 
    deleteAllResults, 
    updateConfig,
    addResult
} from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [results, setResults] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        todayAttempts: 0,
        totalCategories: 0,
        activeStudents: 0
    });
    const [config, setConfig] = useState({
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50,
        maxMarks: 100
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [notification, setNotification] = useState({ type: '', message: '' });
    
    // Question Management States
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        category: 'html',
        difficulty: 'medium',
        marks: 1,
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]
    });

    // Result Management States
    const [showAddResultModal, setShowAddResultModal] = useState(false);
    const [newResult, setNewResult] = useState({
        name: '',
        rollNumber: '',
        category: 'html',
        score: 0,
        totalMarks: 100,
        date: new Date().toISOString().split('T')[0]
    });

    // Analytics States
    const [timeRange, setTimeRange] = useState('week');
    const [analyticsData, setAnalyticsData] = useState({
        dailyAttempts: [],
        categoryPerformance: [],
        studentEngagement: [],
        scoreDistribution: []
    });

    // Available categories with FontAwesome icons
    const categories = [
        { 
            id: 'html', 
            name: 'HTML', 
            icon: <i className="fab fa-html5"></i>,
            color: '#e34c26' 
        },
        { 
            id: 'css', 
            name: 'CSS', 
            icon: <i className="fab fa-css3-alt"></i>,
            color: '#264de4' 
        },
        { 
            id: 'javascript', 
            name: 'JavaScript', 
            icon: <i className="fab fa-js-square"></i>,
            color: '#f0db4f' 
        },
        { 
            id: 'react', 
            name: 'React', 
            icon: <i className="fab fa-react"></i>,
            color: '#61dafb' 
        },
        { 
            id: 'nodejs', 
            name: 'Node.js', 
            icon: <i className="fab fa-node-js"></i>,
            color: '#68a063' 
        },
        { 
            id: 'mongodb', 
            name: 'MongoDB', 
            icon: <i className="fas fa-database"></i>,
            color: '#4db33d' 
        },
        { 
            id: 'express', 
            name: 'Express', 
            icon: <i className="fas fa-server"></i>,
            color: '#000000' 
        },
        { 
            id: 'python', 
            name: 'Python', 
            icon: <i className="fab fa-python"></i>,
            color: '#3776ab' 
        },
        { 
            id: 'fullstack', 
            name: 'Full Stack', 
            icon: <i className="fas fa-layer-group"></i>,
            color: '#8b5cf6' 
        }
    ];

    // Time ranges for analytics
    const timeRanges = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Last 7 Days' },
        { id: 'month', label: 'Last 30 Days' },
        { id: 'year', label: 'Last Year' }
    ];

    const showNotification = useCallback((type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }
        
        loadData();
        loadAnalytics();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const [resultsRes, questionsRes, statsRes, configRes] = await Promise.all([
                getResults(),
                getAllQuestions(),
                getDashboardStats(),
                getConfig()
            ]);
            
            if (resultsRes.data?.success) setResults(resultsRes.data.results || []);
            if (questionsRes.data?.success) setQuestions(questionsRes.data.questions || []);
            
            // Handle stats data with proper parsing
            if (statsRes.data?.success) {
                const statsData = statsRes.data.stats || {};
                console.log('Stats data:', statsData);
                
                setStats({
                    totalStudents: parseInt(statsData.totalStudents) || 0,
                    totalQuestions: parseInt(statsData.totalQuestions) || 0,
                    totalAttempts: parseInt(statsData.totalAttempts) || 0,
                    averageScore: parseFloat(statsData.averageScore) || 0,
                    passRate: parseFloat(statsData.passRate) || 0,
                    todayAttempts: parseInt(statsData.todayAttempts) || 0,
                    totalCategories: parseInt(statsData.totalCategories) || categories.length,
                    activeStudents: parseInt(statsData.activeStudents) || 0
                });
            }
            
            // Handle config data with proper parsing
            if (configRes.data?.success) {
                const configData = configRes.data.config || {};
                console.log('Config data loaded:', configData);
                
                setConfig({
                    quizTime: parseInt(configData.quizTime) || 30,
                    passingPercentage: parseInt(configData.passingPercentage) || 40,
                    totalQuestions: parseInt(configData.totalQuestions) || 50,
                    maxMarks: parseInt(configData.maxMarks) || 100
                });
            }
            
            showNotification('success', 'Data loaded successfully!');
            
        } catch (error) {
            console.error('Error loading data:', error);
            showNotification('error', 'Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = () => {
        // Mock analytics data - Replace with real API calls
        const mockAnalytics = {
            dailyAttempts: generateDailyAttempts(timeRange),
            categoryPerformance: generateCategoryPerformance(),
            studentEngagement: generateStudentEngagement(),
            scoreDistribution: generateScoreDistribution()
        };
        setAnalyticsData(mockAnalytics);
    };

    const generateDailyAttempts = (range) => {
        const days = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 365;
        return Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            attempts: Math.floor(Math.random() * 50) + 10,
            passed: Math.floor(Math.random() * 30) + 5
        }));
    };

    const generateCategoryPerformance = () => {
        return categories.map(cat => ({
            category: cat.name,
            avgScore: Math.floor(Math.random() * 30) + 50,
            totalAttempts: Math.floor(Math.random() * 100) + 20,
            passRate: Math.floor(Math.random() * 40) + 40
        }));
    };

    const generateStudentEngagement = () => {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            day,
            activeStudents: Math.floor(Math.random() * 30) + 10,
            avgTimeSpent: Math.floor(Math.random() * 40) + 20
        }));
    };

    const generateScoreDistribution = () => {
        return [
            { range: '0-20%', count: Math.floor(Math.random() * 10) + 1 },
            { range: '21-40%', count: Math.floor(Math.random() * 15) + 3 },
            { range: '41-60%', count: Math.floor(Math.random() * 20) + 10 },
            { range: '61-80%', count: Math.floor(Math.random() * 25) + 15 },
            { range: '81-100%', count: Math.floor(Math.random() * 30) + 20 }
        ];
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
    };

    const handleExportResults = () => {
        const csvContent = [
            ['Name', 'Roll Number', 'Category', 'Score', 'Percentage', 'Passing %', 'Status', 'Date'],
            ...results.map(r => [
                r.name,
                r.rollNumber,
                r.category,
                r.score || 0,
                `${r.percentage || 0}%`,
                `${r.passingPercentage || config.passingPercentage || 40}%`,
                r.passed ? 'PASS' : 'FAIL',
                r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showNotification('success', 'Results exported successfully!');
    };

    const handleExportAnalytics = () => {
        const analyticsContent = [
            ['Metric', 'Value'],
            ['Total Students', stats.totalStudents],
            ['Total Questions', stats.totalQuestions],
            ['Total Attempts', stats.totalAttempts],
            ['Average Score', `${stats.averageScore}%`],
            ['Pass Rate', `${stats.passRate}%`],
            ['Today Attempts', stats.todayAttempts],
            ['Active Students', stats.activeStudents || 0],
            ['Passing Percentage', `${config.passingPercentage}%`]
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([analyticsContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showNotification('success', 'Analytics exported successfully!');
    };

    const handleAddQuestion = async () => {
        try {
            if (!newQuestion.questionText.trim()) {
                showNotification('error', 'Please enter question text');
                return;
            }
            
            // Check if category already has 100 marks
            const categoryQuestions = questions.filter(q => q.category === newQuestion.category);
            const totalMarksInCategory = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
            
            if (totalMarksInCategory + (newQuestion.marks || 1) > 100) {
                showNotification('error', `Cannot add question. This category already has ${totalMarksInCategory} marks out of 100. Maximum allowed is 100 marks per category.`);
                return;
            }

            // Check if marks exceed 100
            if ((newQuestion.marks || 1) > 100 || (newQuestion.marks || 1) < 1) {
                showNotification('error', 'Question marks must be between 1 and 100');
                return;
            }

            const emptyOptions = newQuestion.options.filter(opt => !opt.text.trim());
            if (emptyOptions.length > 0) {
                showNotification('error', 'Please fill all options');
                return;
            }

            const hasCorrectAnswer = newQuestion.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
                showNotification('error', 'Please mark at least one correct answer');
                return;
            }

            const questionData = {
                category: newQuestion.category,
                questionText: newQuestion.questionText.trim(),
                difficulty: newQuestion.difficulty,
                marks: parseInt(newQuestion.marks) || 1,
                options: newQuestion.options.map((opt, index) => ({
                    text: opt.text.trim(),
                    isCorrect: opt.isCorrect,
                    optionIndex: index + 1
                }))
            };

            const res = await addQuestions(questionData);
            
            if (res.data?.success) {
                showNotification('success', res.data.message || 'Question added successfully!');
                await loadData();
                setShowAddQuestion(false);
                setNewQuestion({
                    questionText: '',
                    category: 'html',
                    difficulty: 'medium',
                    marks: 1,
                    options: [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false }
                    ]
                });
            } else {
                showNotification('error', res.data?.message || 'Failed to add question');
            }
        } catch (error) {
            console.error('Error adding question:', error);
            showNotification('error', `Failed to add question: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddResult = async () => {
        try {
            if (!newResult.name.trim() || !newResult.rollNumber.trim()) {
                showNotification('error', 'Please fill all required fields');
                return;
            }

            if ((newResult.score || 0) > (newResult.totalMarks || 100)) {
                showNotification('error', 'Score cannot exceed total marks');
                return;
            }

            if ((newResult.totalMarks || 100) > 100) {
                showNotification('error', 'Total marks cannot exceed 100');
                return;
            }

            // کنفیگریشن سے پاسنگ پرسنٹیج حاصل کریں
            const passingPercentage = config.passingPercentage || 40;
            
            // پرسیسینٹیج حساب کریں
            const score = newResult.score || 0;
            const totalMarks = newResult.totalMarks || 100;
            const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
            
            // پاسنگ پرسنٹیج کے مطابق پاس/فیل کا فیصلہ کریں
            const passed = percentage >= passingPercentage;

            const resultData = {
                name: newResult.name.trim(),
                rollNumber: newResult.rollNumber.trim(),
                category: newResult.category,
                score: score,
                totalMarks: totalMarks,
                percentage: percentage.toFixed(2),
                passed: passed, // یہاں کنفیگریشن کے مطابق پاس/فیل سیٹ ہوگا
                passingPercentage: passingPercentage, // پاسنگ پرسنٹیج بھی محفوظ کریں
                createdAt: newResult.date ? new Date(newResult.date).toISOString() : new Date().toISOString()
            };

            const res = await addResult(resultData);
            
            if (res.data?.success) {
                showNotification('success', res.data.message || 'Result added successfully!');
                await loadData();
                setShowAddResultModal(false);
                setNewResult({
                    name: '',
                    rollNumber: '',
                    category: 'html',
                    score: 0,
                    totalMarks: 100,
                    date: new Date().toISOString().split('T')[0]
                });
            } else {
                showNotification('error', res.data?.message || 'Failed to add result');
            }
        } catch (error) {
            console.error('Error adding result:', error);
            showNotification('error', `Failed to add result: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleUpdateQuestion = async () => {
        try {
            if (!editingQuestion) return;

            if (!editingQuestion.questionText.trim()) {
                showNotification('error', 'Please enter question text');
                return;
            }

            // Check if marks exceed 100
            if ((editingQuestion.marks || 1) > 100 || (editingQuestion.marks || 1) < 1) {
                showNotification('error', 'Question marks must be between 1 and 100');
                return;
            }

            const hasCorrectAnswer = editingQuestion.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
                showNotification('error', 'Please mark at least one correct answer');
                return;
            }

            const res = await updateQuestion(editingQuestion._id, editingQuestion);
            if (res.data?.success) {
                showNotification('success', 'Question updated successfully!');
                await loadData();
                setEditingQuestion(null);
            } else {
                showNotification('error', 'Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            showNotification('error', 'Failed to update question');
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                const res = await deleteQuestion(id);
                if (res.data?.success) {
                    showNotification('success', 'Question deleted successfully!');
                    await loadData();
                }
            } catch (error) {
                console.error('Error deleting question:', error);
                showNotification('error', 'Failed to delete question');
            }
        }
    };

    const handleDeleteResult = async (id) => {
        if (window.confirm('Are you sure you want to delete this result?')) {
            try {
                const res = await deleteResult(id);
                if (res.data?.success) {
                    showNotification('success', 'Result deleted successfully!');
                    await loadData();
                }
            } catch (error) {
                console.error('Error deleting result:', error);
                showNotification('error', 'Failed to delete result');
            }
        }
    };

    const handleDeleteAllResults = async () => {
        if (window.confirm('Are you sure you want to delete ALL results? This action cannot be undone.')) {
            try {
                const res = await deleteAllResults();
                if (res.data?.success) {
                    showNotification('success', 'All results deleted successfully!');
                    await loadData();
                }
            } catch (error) {
                console.error('Error deleting all results:', error);
                showNotification('error', 'Failed to delete results');
            }
        }
    };

    const handleUpdateConfig = async () => {
        try {
            // Ensure all values are valid numbers
            const updatedConfig = {
                quizTime: parseInt(config.quizTime) || 30,
                passingPercentage: parseInt(config.passingPercentage) || 40,
                totalQuestions: parseInt(config.totalQuestions) || 50,
                maxMarks: parseInt(config.maxMarks) || 100
            };
            
            const res = await updateConfig(updatedConfig);
            if (res.data?.success) {
                showNotification('success', 'Configuration updated successfully!');
                await loadData();
            }
        } catch (error) {
            console.error('Error updating config:', error);
            showNotification('error', 'Failed to update configuration');
        }
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index][field] = value;
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    const handleCorrectAnswer = (index) => {
        const updatedOptions = newQuestion.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    const filterQuestionsByCategory = (category) => {
        return category === 'all' ? questions : questions.filter(q => q.category === category);
    };

    const filterResults = (results) => {
        return results.filter(result => {
            const matchesSearch = searchTerm === '' || 
                (result.name && result.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (result.rollNumber && result.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || 
                result.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
    };

    const calculateCategoryStats = () => {
        return categories.reduce((acc, cat) => {
            const categoryQuestions = questions.filter(q => q.category === cat.id);
            const totalMarks = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
            acc[cat.id] = {
                count: categoryQuestions.length,
                totalMarks: totalMarks
            };
            return acc;
        }, {});
    };

    // Helper function to get category icon by name
    const getCategoryIcon = (categoryName) => {
        const cat = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
        return cat ? cat.icon : <i className="fas fa-question-circle"></i>;
    };

    // Helper function to get category display name (for HTML/CSS/JavaScript)
    const getCategoryDisplayName = (categoryName) => {
        switch(categoryName?.toLowerCase()) {
            case 'html':
            case 'css':
            case 'javascript':
                return categoryName;
            default:
                return categoryName || 'General';
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    const categoryStats = calculateCategoryStats();
    const filteredQuestions = filterQuestionsByCategory(selectedCategory);
    const filteredResults = filterResults(results);
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;

    return (
        <div className="admin-container">
            {/* Notification */}
            {notification.message && (
                <div className={`notification notification-${notification.type}`}>
                    <span className="notification-icon">
                        {notification.type === 'success' ? '✓' : '⚠'}
                    </span>
                    {notification.message}
                </div>
            )}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <i className="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div className="logo-text">
                            <h3>Shamsi Institute</h3>
                            <span>Quiz Analytics System</span>
                        </div>
                    </div>
                </div>

                <div className="admin-info">
                    <div className="admin-avatar">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <div className="admin-details">
                        <h4>Administrator</h4>
                        <p>Super Admin</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <i className="fas fa-chart-line"></i>
                        <span>Analytics</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('results')}
                    >
                        <i className="fas fa-clipboard-list"></i>
                        <span>Results</span>
                        <span className="badge">{results.length}</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'questions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('questions')}
                    >
                        <i className="fas fa-question-circle"></i>
                        <span>Questions</span>
                        <span className="badge">{questions.length}</span>
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="main-header">
                    <div className="header-content">
                        <div className="institute-title">
                            <div className="institute-logo-large">
                                <i className="fas fa-university"></i>
                            </div>
                            <div>
                                <h1>
                                    {activeTab === 'dashboard' && 'Shamsi Institute - Dashboard Overview'}
                                    {activeTab === 'analytics' && 'Shamsi Institute - Analytics & Insights'}
                                    {activeTab === 'results' && 'Shamsi Institute - Assessment Results'}
                                    {activeTab === 'questions' && 'Shamsi Institute - Question Bank'}
                                    {activeTab === 'settings' && 'Shamsi Institute - System Settings'}
                                </h1>
                                <p className="institute-subtitle">
                                    Technical Skills Assessment Management System
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="refresh-btn" onClick={loadData}>
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </header>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="dashboard-content">
                        {/* Stats Cards */}
                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Students</h3>
                                    <div className="stat-value">{stats.totalStudents || 0}</div>
                                    <div className="stat-change">+12% this month</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-question"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Questions</h3>
                                    <div className="stat-value">{stats.totalQuestions || 0}</div>
                                    <div className="stat-change">+5 this week</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-clipboard-check"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Attempts</h3>
                                    <div className="stat-value">{stats.totalAttempts || 0}</div>
                                    <div className="stat-change">+{stats.todayAttempts || 0} today</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-trophy"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Pass Rate</h3>
                                    <div className="stat-value">{stats.passRate || 0}%</div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${stats.passRate || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="metrics-section">
                            <div className="metric-row">
                                <div className="metric-card">
                                    <h4>Average Score</h4>
                                    <div className="metric-value">{stats.averageScore || 0}%</div>
                                    <div className="metric-progress">
                                        <div className="progress-fill" style={{ width: `${stats.averageScore || 0}%` }}></div>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <h4>Pass/Fail Ratio</h4>
                                    <div className="metric-value">{passedCount} / {failedCount}</div>
                                    <div className="ratio-display">
                                        <div className="ratio-bar passed" style={{ width: `${(passedCount / results.length) * 100}%` }}></div>
                                        <div className="ratio-bar failed" style={{ width: `${(failedCount / results.length) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <h4>Active Students</h4>
                                    <div className="metric-value">{stats.activeStudents || 0}</div>
                                    <div className="metric-trend"><i className="fas fa-arrow-up"></i> 15% increase</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Assessments */}
                        <div className="recent-section">
                            <div className="section-header">
                                <h2>Recent Assessments</h2>
                                <button 
                                    className="view-all-btn"
                                    onClick={() => setActiveTab('results')}
                                >
                                    View All <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                            <div className="assessments-list">
                                {results.slice(0, 5).map((result, index) => (
                                    <div key={index} className="assessment-item">
                                        <div className="student-avatar">
                                            {result.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className="assessment-details">
                                            <div className="student-info">
                                                <h4>{result.name || 'Student'}</h4>
                                                <span className="roll-number">{result.rollNumber || 'N/A'}</span>
                                            </div>
                                            <div className="assessment-info">
                                                <span className={`status ${result.passed ? 'passed' : 'failed'}`}>
                                                    {result.passed ? 'Passed' : 'Failed'}
                                                </span>
                                                <span className="category">
                                                    {getCategoryIcon(result.category)}
                                                    {getCategoryDisplayName(result.category)}
                                                </span>
                                                <span className="score">{result.score || 0}/{result.totalMarks || 0}</span>
                                            </div>
                                        </div>
                                        <div className="assessment-time">
                                            {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-section">
                            <h3>Quick Actions</h3>
                            <div className="action-buttons">
                                <button className="action-btn" onClick={() => setActiveTab('analytics')}>
                                    <i className="fas fa-chart-line"></i>
                                    View Analytics
                                </button>
                                <button className="action-btn" onClick={() => setShowAddQuestion(true)}>
                                    <i className="fas fa-plus"></i>
                                    Add Question
                                </button>
                                <button className="action-btn" onClick={handleExportResults}>
                                    <i className="fas fa-download"></i>
                                    Export Results
                                </button>
                                <button className="action-btn" onClick={() => setShowAddResultModal(true)}>
                                    <i className="fas fa-user-plus"></i>
                                    Add Result
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="analytics-content">
                        <div className="analytics-header">
                            <h2>Analytics & Insights</h2>
                            <div className="time-range-selector">
                                {timeRanges.map(range => (
                                    <button
                                        key={range.id}
                                        className={`time-range-btn ${timeRange === range.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setTimeRange(range.id);
                                            loadAnalytics();
                                        }}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="analytics-grid">
                            {/* Daily Attempts Chart */}
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>Daily Attempts Trend</h3>
                                    <button className="export-btn" onClick={handleExportAnalytics}>
                                        <i className="fas fa-download"></i> Export
                                    </button>
                                </div>
                                <div className="chart-container">
                                    <div className="bar-chart">
                                        {analyticsData.dailyAttempts.map((day, index) => (
                                            <div key={index} className="bar-group">
                                                <div 
                                                    className="bar attempted" 
                                                    style={{ height: `${(day.attempts / 60) * 100}%` }}
                                                    title={`${day.attempts} attempts`}
                                                ></div>
                                                <div 
                                                    className="bar passed" 
                                                    style={{ height: `${(day.passed / 60) * 100}%` }}
                                                    title={`${day.passed} passed`}
                                                ></div>
                                                <div className="bar-label">{day.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="chart-legend">
                                        <div className="legend-item">
                                            <div className="legend-color attempted"></div>
                                            <span>Attempts</span>
                                        </div>
                                        <div className="legend-item">
                                            <div className="legend-color passed"></div>
                                            <span>Passed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Performance */}
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>Category Performance</h3>
                                </div>
                                <div className="category-performance">
                                    {analyticsData.categoryPerformance.map((category, index) => (
                                        <div key={index} className="category-performance-item">
                                            <div className="category-info">
                                                <span className="category-name">{category.category}</span>
                                                <span className="category-stats">
                                                    {category.avgScore}% avg • {category.totalAttempts} attempts
                                                </span>
                                            </div>
                                            <div className="performance-bar">
                                                <div 
                                                    className="bar-fill" 
                                                    style={{ 
                                                        width: `${category.passRate}%`,
                                                        backgroundColor: categories.find(c => c.name === category.category)?.color || '#4361ee'
                                                    }}
                                                ></div>
                                                <span className="pass-rate">{category.passRate}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Score Distribution */}
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>Score Distribution</h3>
                                </div>
                                <div className="score-distribution">
                                    {analyticsData.scoreDistribution.map((dist, index) => (
                                        <div key={index} className="distribution-item">
                                            <div className="distribution-label">{dist.range}</div>
                                            <div className="distribution-bar">
                                                <div 
                                                    className="distribution-fill"
                                                    style={{ width: `${(dist.count / 50) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="distribution-count">{dist.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Student Engagement */}
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>Student Engagement</h3>
                                </div>
                                <div className="engagement-metrics">
                                    <div className="engagement-chart">
                                        {analyticsData.studentEngagement.map((day, index) => (
                                            <div key={index} className="engagement-group">
                                                <div className="engagement-bars">
                                                    <div 
                                                        className="engagement-bar students"
                                                        style={{ height: `${(day.activeStudents / 40) * 100}%` }}
                                                        title={`${day.activeStudents} students`}
                                                    ></div>
                                                    <div 
                                                        className="engagement-bar time"
                                                        style={{ height: `${(day.avgTimeSpent / 60) * 100}%` }}
                                                        title={`${day.avgTimeSpent} mins avg`}
                                                    ></div>
                                                </div>
                                                <div className="engagement-label">{day.day}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="engagement-legend">
                                        <div className="legend-item">
                                            <div className="legend-color students"></div>
                                            <span>Active Students</span>
                                        </div>
                                        <div className="legend-item">
                                            <div className="legend-color time"></div>
                                            <span>Avg Time (mins)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="analytics-card metrics-card">
                                <div className="card-header">
                                    <h3>Key Metrics</h3>
                                </div>
                                <div className="key-metrics">
                                    <div className="key-metric">
                                        <div className="metric-label">Average Time Per Quiz</div>
                                        <div className="metric-value">24.5 min</div>
                                        <div className="metric-change"><i className="fas fa-arrow-up"></i> 8%</div>
                                    </div>
                                    <div className="key-metric">
                                        <div className="metric-label">Completion Rate</div>
                                        <div className="metric-value">92%</div>
                                        <div className="metric-change"><i className="fas fa-arrow-up"></i> 5%</div>
                                    </div>
                                    <div className="key-metric">
                                        <div className="metric-label">Avg Questions Attempted</div>
                                        <div className="metric-value">8.7/10</div>
                                        <div className="metric-change"><i className="fas fa-arrow-up"></i> 12%</div>
                                    </div>
                                    <div className="key-metric">
                                        <div className="metric-label">Retake Rate</div>
                                        <div className="metric-value">18%</div>
                                        <div className="metric-change"><i className="fas fa-arrow-down"></i> 3%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Performers */}
                            <div className="analytics-card performers-card">
                                <div className="card-header">
                                    <h3>Top Performers</h3>
                                </div>
                                <div className="top-performers">
                                    {results
                                        .filter(r => r.passed)
                                        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
                                        .slice(0, 5)
                                        .map((result, index) => (
                                            <div key={index} className="performer-item">
                                                <div className="performer-rank">{index + 1}</div>
                                                <div className="performer-avatar">
                                                    {result.name?.charAt(0) || 'S'}
                                                </div>
                                                <div className="performer-details">
                                                    <div className="performer-name">{result.name || 'Student'}</div>
                                                    <div className="performer-category">
                                                        {getCategoryIcon(result.category)}
                                                        {getCategoryDisplayName(result.category)}
                                                    </div>
                                                </div>
                                                <div className="performer-score">{result.percentage || 0}%</div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="insights-section">
                            <h3>Insights & Recommendations</h3>
                            <div className="insights-list">
                                <div className="insight-card">
                                    <div className="insight-icon"><i className="fas fa-chart-line"></i></div>
                                    <div className="insight-content">
                                        <h4>Performance Trend</h4>
                                        <p>Overall quiz performance has improved by 15% over the last month.</p>
                                    </div>
                                </div>
                                <div className="insight-card">
                                    <div className="insight-icon"><i className="fas fa-bullseye"></i></div>
                                    <div className="insight-content">
                                        <h4>Category Focus</h4>
                                        <p>Students are performing best in React (85% pass rate) and struggling with Node.js (45% pass rate).</p>
                                    </div>
                                </div>
                                <div className="insight-card">
                                    <div className="insight-icon"><i className="fas fa-clock"></i></div>
                                    <div className="insight-content">
                                        <h4>Engagement Pattern</h4>
                                        <p>Most active time for quizzes is between 2 PM - 5 PM with 65% of daily attempts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="results-content">
                        <div className="section-header">
                            <div>
                                <h2>Assessment Results</h2>
                                <p>Total {filteredResults.length} results found</p>
                            </div>
                            <div className="section-actions">
                                <select 
                                    className="category-filter"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <button className="btn primary" onClick={handleExportResults}>
                                    <i className="fas fa-download"></i>
                                    Export CSV
                                </button>
                                <button 
                                    className="btn primary add-result-btn"
                                    onClick={() => setShowAddResultModal(true)}
                                >
                                    <i className="fas fa-plus"></i> Add Result
                                </button>
                            </div>
                        </div>

                        <div className="results-table-container">
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Roll No</th>
                                        <th>Category</th>
                                        <th>Score</th>
                                        <th>Percentage</th>
                                        <th>Passing %</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="no-results">
                                                <i className="fas fa-search"></i> No results found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredResults.map((result, index) => {
                                            const passingPercentage = result.passingPercentage || config.passingPercentage || 40;
                                            const isPassed = (result.percentage || 0) >= passingPercentage;
                                            
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <div className="student-cell">
                                                            <div className="avatar">{result.name?.charAt(0) || 'S'}</div>
                                                            <div>
                                                                <div className="name">{result.name || 'Student'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <code>{result.rollNumber || 'N/A'}</code>
                                                    </td>
                                                    <td>
                                                        <span className="category-tag">
                                                            {getCategoryIcon(result.category)}
                                                            {getCategoryDisplayName(result.category)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="score-cell">
                                                            <strong>{result.score || 0}</strong>
                                                            <span>/{result.totalMarks || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="percentage-cell">
                                                            <div className="percentage-bar">
                                                                <div 
                                                                    className="percentage-fill"
                                                                    style={{ width: `${result.percentage || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span>{result.percentage || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="passing-percentage">
                                                            {passingPercentage}%
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${isPassed ? 'passed' : 'failed'}`}>
                                                            {isPassed ? (
                                                                <>
                                                                    <i className="fas fa-check-circle"></i> Passed
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-times-circle"></i> Failed
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteResult(result._id)}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Result Modal */}
                        {showAddResultModal && (
                            <div className="modal-overlay">
                                <div className="modal">
                                    <div className="modal-header">
                                        <h3>
                                            <i className="fas fa-user-graduate"></i>
                                            Add Student Result
                                        </h3>
                                        <button 
                                            className="modal-close"
                                            onClick={() => {
                                                setShowAddResultModal(false);
                                                setNewResult({
                                                    name: '',
                                                    rollNumber: '',
                                                    category: 'html',
                                                    score: 0,
                                                    totalMarks: 100,
                                                    date: new Date().toISOString().split('T')[0]
                                                });
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-user"></i> Student Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newResult.name}
                                                    onChange={(e) => setNewResult({...newResult, name: e.target.value})}
                                                    placeholder="Enter student name"
                                                    className="form-control"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-id-card"></i> Roll Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newResult.rollNumber}
                                                    onChange={(e) => setNewResult({...newResult, rollNumber: e.target.value})}
                                                    placeholder="Enter roll number"
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-folder"></i> Category *
                                                </label>
                                                <select
                                                    value={newResult.category}
                                                    onChange={(e) => setNewResult({...newResult, category: e.target.value})}
                                                    className="form-control"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.icon} {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-star"></i> Score (Max: {newResult.totalMarks}) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={newResult.totalMarks}
                                                    value={newResult.score}
                                                    onChange={(e) => {
                                                        const score = parseInt(e.target.value) || 0;
                                                        setNewResult({...newResult, score: score});
                                                    }}
                                                    className="form-control"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-trophy"></i> Total Marks *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={newResult.totalMarks}
                                                    onChange={(e) => {
                                                        const total = parseInt(e.target.value) || 100;
                                                        setNewResult({
                                                            ...newResult, 
                                                            totalMarks: total,
                                                            score: Math.min(newResult.score, total)
                                                        });
                                                    }}
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <i className="fas fa-calendar"></i> Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newResult.date}
                                                onChange={(e) => setNewResult({...newResult, date: e.target.value})}
                                                className="form-control"
                                            />
                                        </div>

                                        {/* Result Preview */}
                                        {newResult.name && newResult.totalMarks > 0 && (
                                            <div className="result-preview">
                                                <h4>Result Preview:</h4>
                                                <div className="preview-content">
                                                    <div className="preview-item">
                                                        <span>Name:</span>
                                                        <strong>{newResult.name}</strong>
                                                    </div>
                                                    <div className="preview-item">
                                                        <span>Roll No:</span>
                                                        <strong>{newResult.rollNumber}</strong>
                                                    </div>
                                                    <div className="preview-item">
                                                        <span>Category:</span>
                                                        <strong>{categories.find(c => c.id === newResult.category)?.name}</strong>
                                                    </div>
                                                    <div className="preview-item">
                                                        <span>Score:</span>
                                                        <strong>{newResult.score}/{newResult.totalMarks}</strong>
                                                    </div>
                                                    <div className="preview-item">
                                                        <span>Percentage:</span>
                                                        <strong>{((newResult.score / newResult.totalMarks) * 100).toFixed(2)}%</strong>
                                                    </div>
                                                    <div className="preview-item">
                                                        <span>Passing Requirement:</span>
                                                        <strong>{config.passingPercentage || 40}%</strong>
                                                    </div>
                                                    <div className="preview-item">
                                                        <span>Status:</span>
                                                        <strong className={((newResult.score / newResult.totalMarks) * 100) >= (config.passingPercentage || 40) ? 'passed' : 'failed'}>
                                                            {((newResult.score / newResult.totalMarks) * 100) >= (config.passingPercentage || 40) ? (
                                                                <>
                                                                    <i className="fas fa-check-circle"></i> PASS
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-times-circle"></i> FAIL
                                                                </>
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-footer">
                                        <button 
                                            className="btn secondary"
                                            onClick={() => {
                                                setShowAddResultModal(false);
                                                setNewResult({
                                                    name: '',
                                                    rollNumber: '',
                                                    category: 'html',
                                                    score: 0,
                                                    totalMarks: 100,
                                                    date: new Date().toISOString().split('T')[0]
                                                });
                                            }}
                                        >
                                            <i className="fas fa-times"></i> Cancel
                                        </button>
                                        <button 
                                            className="btn primary"
                                            onClick={handleAddResult}
                                            disabled={!newResult.name.trim() || !newResult.rollNumber.trim() || newResult.totalMarks > 100}
                                        >
                                            <i className="fas fa-save"></i> Save Result
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <div className="questions-content">
                        <div className="section-header">
                            <div>
                                <h2>Question Bank</h2>
                                <p>Total {questions.length} questions in database</p>
                            </div>
                            <div className="section-actions">
                                <button 
                                    className="btn primary add-btn"
                                    onClick={() => setShowAddQuestion(true)}
                                >
                                    <i className="fas fa-plus"></i>
                                    Add Question
                                </button>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="category-tabs">
                            <button 
                                className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                <i className="fas fa-layer-group"></i>
                                All Questions ({questions.length})
                            </button>
                            {categories.map(cat => {
                                const stat = categoryStats[cat.id] || { count: 0, totalMarks: 0 };
                                const isMaxLimit = stat.totalMarks >= 100;
                                return (
                                    <button 
                                        key={cat.id}
                                        className={`category-tab ${selectedCategory === cat.id ? 'active' : ''} ${isMaxLimit ? 'max-limit' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        disabled={isMaxLimit}
                                        title={isMaxLimit ? `Maximum 100 marks reached (${stat.totalMarks}/100)` : `${stat.count} questions, ${stat.totalMarks}/100 marks`}
                                        style={{ 
                                            borderColor: cat.color,
                                            backgroundColor: selectedCategory === cat.id ? cat.color : 'white',
                                            color: selectedCategory === cat.id ? 'white' : cat.color,
                                            opacity: isMaxLimit ? 0.6 : 1
                                        }}
                                    >
                                        {cat.icon}
                                        {cat.name} ({stat.totalMarks}/100)
                                        {isMaxLimit && <i className="fas fa-lock ml-1"></i>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Questions List */}
                        <div className="questions-list">
                            {filteredQuestions.length === 0 ? (
                                <div className="no-questions">
                                    <i className="fas fa-question-circle fa-3x"></i>
                                    <h3>No questions found</h3>
                                    <p>Click "Add Question" to start adding questions</p>
                                </div>
                            ) : (
                                filteredQuestions.map((question, index) => {
                                    const categoryInfo = categories.find(c => c.id === question.category);
                                    const stat = categoryStats[question.category] || { totalMarks: 0 };
                                    const isCategoryFull = stat.totalMarks >= 100;
                                    return (
                                        <div key={question._id} className="question-card">
                                            <div className="question-header">
                                                <div className="question-meta">
                                                    <span className="question-number">Q{index + 1}</span>
                                                    <span className={`difficulty ${question.difficulty}`}>
                                                        <i className={`fas fa-signal ${question.difficulty === 'easy' ? 'text-success' : question.difficulty === 'medium' ? 'text-warning' : 'text-danger'}`}></i>
                                                        {question.difficulty}
                                                    </span>
                                                    <span 
                                                        className="category-tag"
                                                        style={{ 
                                                            backgroundColor: categoryInfo?.color + '20',
                                                            color: categoryInfo?.color,
                                                            borderColor: categoryInfo?.color
                                                        }}
                                                    >
                                                        {categoryInfo?.icon}
                                                        {question.category}
                                                        {isCategoryFull && <i className="fas fa-lock ml-1"></i>}
                                                    </span>
                                                    <span className="marks">
                                                        <i className="fas fa-star"></i> {question.marks || 1} marks
                                                    </span>
                                                </div>
                                                <div className="question-actions">
                                                    <button 
                                                        className="icon-btn"
                                                        onClick={() => setEditingQuestion(question)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="icon-btn delete"
                                                        onClick={() => handleDeleteQuestion(question._id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="question-body">
                                                <p className="question-text">{question.questionText}</p>
                                                <div className="options-list">
                                                    {question.options.map((option, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={`option ${option.isCorrect ? 'correct' : ''}`}
                                                        >
                                                            <span className="option-letter">
                                                                {String.fromCharCode(65 + idx)}
                                                            </span>
                                                            <span className="option-text">{option.text}</span>
                                                            {option.isCorrect && (
                                                                <span className="correct-indicator">
                                                                    <i className="fas fa-check"></i>
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Add/Edit Question Modal */}
                        {(showAddQuestion || editingQuestion) && (
                            <div className="modal-overlay">
                                <div className="modal">
                                    <div className="modal-header">
                                        <h3>
                                            <i className="fas fa-question-circle"></i>
                                            {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                        </h3>
                                        <button 
                                            className="modal-close"
                                            onClick={() => {
                                                setShowAddQuestion(false);
                                                setEditingQuestion(null);
                                                setNewQuestion({
                                                    questionText: '',
                                                    category: 'html',
                                                    difficulty: 'medium',
                                                    marks: 1,
                                                    options: [
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false }
                                                    ]
                                                });
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>
                                                <i className="fas fa-question"></i> Question Text *
                                            </label>
                                            <textarea
                                                value={editingQuestion ? editingQuestion.questionText : newQuestion.questionText}
                                                onChange={(e) => editingQuestion 
                                                    ? setEditingQuestion({...editingQuestion, questionText: e.target.value})
                                                    : setNewQuestion({...newQuestion, questionText: e.target.value})
                                                }
                                                rows="3"
                                                placeholder="Enter your question here..."
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-folder"></i> Category *
                                                </label>
                                                <select
                                                    value={editingQuestion ? editingQuestion.category : newQuestion.category}
                                                    onChange={(e) => {
                                                        const selectedCategory = e.target.value;
                                                        const categoryQuestions = questions.filter(q => q.category === selectedCategory);
                                                        const totalMarksInCategory = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
                                                        
                                                        if (totalMarksInCategory >= 100 && !editingQuestion) {
                                                            showNotification('error', `This category already has ${totalMarksInCategory} marks out of 100. Cannot add more questions.`);
                                                            return;
                                                        }
                                                        
                                                        editingQuestion 
                                                            ? setEditingQuestion({...editingQuestion, category: selectedCategory})
                                                            : setNewQuestion({...newQuestion, category: selectedCategory});
                                                    }}
                                                    className="form-control"
                                                >
                                                    {categories.map(cat => {
                                                        const categoryQuestions = questions.filter(q => q.category === cat.id);
                                                        const totalMarks = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
                                                        const isDisabled = totalMarks >= 100 && !editingQuestion;
                                                        return (
                                                            <option key={cat.id} value={cat.id} disabled={isDisabled}>
                                                                {cat.icon} {cat.name} ({totalMarks}/100 marks)
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {(() => {
                                                    const categoryQuestions = questions.filter(q => q.category === (editingQuestion ? editingQuestion.category : newQuestion.category));
                                                    const totalMarks = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
                                                    
                                                    if (totalMarks >= 100) {
                                                        return (
                                                            <small className="text-danger">
                                                                <i className="fas fa-exclamation-triangle"></i> 
                                                                Maximum limit reached (100 marks). Cannot add more questions to this category.
                                                            </small>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <small className="form-text">
                                                            {categoryQuestions.length} questions, {totalMarks}/100 marks in this category
                                                        </small>
                                                    );
                                                })()}
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-signal"></i> Difficulty *
                                                </label>
                                                <select
                                                    value={editingQuestion ? editingQuestion.difficulty : newQuestion.difficulty}
                                                    onChange={(e) => editingQuestion 
                                                        ? setEditingQuestion({...editingQuestion, difficulty: e.target.value})
                                                        : setNewQuestion({...newQuestion, difficulty: e.target.value})
                                                    }
                                                    className="form-control"
                                                >
                                                    <option value="easy"><i className="fas fa-circle text-success"></i> Easy</option>
                                                    <option value="medium"><i className="fas fa-circle text-warning"></i> Medium</option>
                                                    <option value="hard"><i className="fas fa-circle text-danger"></i> Hard</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <i className="fas fa-star"></i> Marks (Max: 100) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={editingQuestion ? editingQuestion.marks || 1 : newQuestion.marks || 1}
                                                    onChange={(e) => {
                                                        const marks = parseInt(e.target.value) || 1;
                                                        if (marks > 100) {
                                                            showNotification('error', 'Marks cannot exceed 100');
                                                            return;
                                                        }
                                                        
                                                        // Check if adding these marks would exceed 100 for the category
                                                        if (!editingQuestion) {
                                                            const categoryQuestions = questions.filter(q => q.category === newQuestion.category);
                                                            const totalMarksInCategory = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
                                                            
                                                            if (totalMarksInCategory + marks > 100) {
                                                                showNotification('error', `Cannot add ${marks} marks. This category already has ${totalMarksInCategory} marks. Maximum allowed is 100 marks per category.`);
                                                                return;
                                                            }
                                                        }
                                                        
                                                        editingQuestion 
                                                            ? setEditingQuestion({...editingQuestion, marks: marks})
                                                            : setNewQuestion({...newQuestion, marks: marks});
                                                    }}
                                                    className="form-control"
                                                />
                                                <small className="form-text">Maximum marks per question is 100</small>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <i className="fas fa-list-ul"></i> Options * (Select correct answer)
                                            </label>
                                            <div className="options-container">
                                                {(editingQuestion ? editingQuestion.options : newQuestion.options).map((option, index) => (
                                                    <div key={index} className="option-input-group">
                                                        <div className="option-letter">
                                                            {String.fromCharCode(65 + index)}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => editingQuestion
                                                                ? setEditingQuestion({
                                                                    ...editingQuestion,
                                                                    options: editingQuestion.options.map((opt, i) => 
                                                                        i === index ? { ...opt, text: e.target.value } : opt
                                                                    )
                                                                })
                                                                : handleOptionChange(index, 'text', e.target.value)
                                                            }
                                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                            className="form-control"
                                                        />
                                                        <button
                                                            className={`correct-toggle ${option.isCorrect ? 'active' : ''}`}
                                                            onClick={() => editingQuestion
                                                                ? setEditingQuestion({
                                                                    ...editingQuestion,
                                                                    options: editingQuestion.options.map((opt, i) => ({
                                                                        ...opt,
                                                                        isCorrect: i === index
                                                                    }))
                                                                })
                                                                : handleCorrectAnswer(index)
                                                            }
                                                        >
                                                            {option.isCorrect ? (
                                                                <>
                                                                    <i className="fas fa-check"></i> Correct
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-times"></i> Mark Correct
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button 
                                            className="btn secondary"
                                            onClick={() => {
                                                setShowAddQuestion(false);
                                                setEditingQuestion(null);
                                                setNewQuestion({
                                                    questionText: '',
                                                    category: 'html',
                                                    difficulty: 'medium',
                                                    marks: 1,
                                                    options: [
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false }
                                                    ]
                                                });
                                            }}
                                        >
                                            <i className="fas fa-times"></i> Cancel
                                        </button>
                                        <button 
                                            className="btn primary"
                                            onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                                            disabled={(() => {
                                                if (!editingQuestion) {
                                                    const categoryQuestions = questions.filter(q => q.category === newQuestion.category);
                                                    const totalMarksInCategory = categoryQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
                                                    return totalMarksInCategory + (newQuestion.marks || 1) > 100 || (newQuestion.marks || 1) > 100;
                                                }
                                                return (editingQuestion.marks || 1) > 100;
                                            })()}
                                        >
                                            {editingQuestion ? (
                                                <>
                                                    <i className="fas fa-save"></i> Update Question
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus"></i> Add Question
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="settings-content">
                        <div className="section-header">
                            <h2>System Settings</h2>
                            <p>Configure quiz parameters that will apply to all assessments</p>
                        </div>

                        <div className="settings-cards">
                            <div className="settings-card">
                                <div className="card-header">
                                    <h3><i className="fas fa-cog"></i> Quiz Configuration</h3>
                                    <p>Configure quiz settings</p>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label><i className="fas fa-clock"></i> Quiz Duration (minutes)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="180"
                                            value={config.quizTime || 30}
                                            onChange={(e) => setConfig({
                                                ...config, 
                                                quizTime: parseInt(e.target.value) || 30
                                            })}
                                            className="form-control"
                                        />
                                        <small className="form-text">Duration of the quiz in minutes</small>
                                    </div>

                                    <div className="form-group">
                                        <label><i className="fas fa-percentage"></i> Passing Percentage</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={config.passingPercentage || 40}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= 0 && value <= 100) {
                                                    setConfig({
                                                        ...config, 
                                                        passingPercentage: value
                                                    });
                                                }
                                            }}
                                            className="form-control"
                                        />
                                        <small className="form-text">
                                            Minimum percentage required to pass. 
                                            <br />
                                            <strong>Current setting: {config.passingPercentage || 40}%</strong>
                                            <br />
                                            Students scoring {config.passingPercentage || 40}% or above will PASS.
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label><i className="fas fa-question"></i> Questions per Quiz</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={config.totalQuestions || 50}
                                            onChange={(e) => setConfig({
                                                ...config, 
                                                totalQuestions: parseInt(e.target.value) || 50
                                            })}
                                            className="form-control"
                                        />
                                        <small className="form-text">Number of questions in each quiz</small>
                                    </div>

                                    <div className="form-group">
                                        <label><i className="fas fa-star"></i> Maximum Marks per Question</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={config.maxMarks || 100}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value > 100) {
                                                    showNotification('error', 'Maximum marks cannot exceed 100');
                                                    return;
                                                }
                                                setConfig({...config, maxMarks: value});
                                            }}
                                            className="form-control"
                                        />
                                        <small className="form-text">Maximum marks for a single question (Max: 100)</small>
                                    </div>

                                    <button 
                                        className="btn primary save-btn"
                                        onClick={handleUpdateConfig}
                                    >
                                        <i className="fas fa-save"></i> Save Settings
                                    </button>
                                </div>
                            </div>

                            <div className="settings-card">
                                <div className="card-header">
                                    <h3><i className="fas fa-info-circle"></i> System Info</h3>
                                    <p>Current system statistics</p>
                                </div>
                                <div className="card-body">
                                    <div className="system-stats">
                                        <div className="stat-item">
                                            <span><i className="fas fa-question"></i> Questions</span>
                                            <strong>{questions.length}</strong>
                                        </div>
                                        <div className="stat-item">
                                            <span><i className="fas fa-clipboard-list"></i> Results</span>
                                            <strong>{results.length}</strong>
                                        </div>
                                        <div className="stat-item">
                                            <span><i className="fas fa-chart-bar"></i> Avg. Score</span>
                                            <strong>{stats.averageScore || 0}%</strong>
                                        </div>
                                        <div className="stat-item">
                                            <span><i className="fas fa-trophy"></i> Pass Rate</span>
                                            <strong>{stats.passRate || 0}%</strong>
                                        </div>
                                        <div className="stat-item">
                                            <span><i className="fas fa-folder"></i> Categories</span>
                                            <strong>{categories.length}</strong>
                                        </div>
                                        <div className="stat-item">
                                            <span><i className="fas fa-users"></i> Active Students</span>
                                            <strong>{stats.activeStudents || 0}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card danger">
                                <div className="card-header">
                                    <h3><i className="fas fa-exclamation-triangle"></i> Danger Zone</h3>
                                    <p>Irreversible actions</p>
                                </div>
                                <div className="card-body">
                                    <button 
                                        className="btn danger"
                                        onClick={handleDeleteAllResults}
                                    >
                                        <i className="fas fa-trash"></i> Delete All Results
                                    </button>
                                    <p className="warning-text">
                                        <i className="fas fa-exclamation-circle"></i>
                                        Warning: This will permanently delete all assessment results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;