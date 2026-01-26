// pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getConfig, 
    updateConfig, 
    getResults, 
    getAllQuestions,
    getDashboardStats,
    addQuestion,
    deleteQuestion,
    deleteResult,
    deleteAllResults,
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

    const categories = [
        { id: 'html', name: 'HTML', icon: 'fa-html5', color: '#e34c26' },
        { id: 'css', name: 'CSS', icon: 'fa-css3-alt', color: '#264de4' },
        { id: 'javascript', name: 'JavaScript', icon: 'fa-js-square', color: '#f0db4f' },
        { id: 'react', name: 'React', icon: 'fa-react', color: '#61dafb' },
        { id: 'nodejs', name: 'Node.js', icon: 'fa-node-js', color: '#68a063' },
        { id: 'mongodb', name: 'MongoDB', icon: 'fa-database', color: '#4db33d' }
    ];

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }
        
        loadData();
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
            
            if (statsRes.data?.success) {
                const statsData = statsRes.data.stats || {};
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
            
            if (configRes.data?.success) {
                const configData = configRes.data.config || {};
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

    const handleAddQuestion = async () => {
        try {
            if (!newQuestion.questionText.trim()) {
                showNotification('error', 'Please enter question text');
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

            const res = await addQuestion(questionData);
            
            if (res.data?.success) {
                showNotification('success', 'Question added successfully!');
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

            const passingPercentage = config.passingPercentage || 40;
            const score = newResult.score || 0;
            const totalMarks = newResult.totalMarks || 100;
            const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
            const passed = percentage >= passingPercentage;

            const resultData = {
                name: newResult.name.trim(),
                rollNumber: newResult.rollNumber.trim(),
                category: newResult.category,
                score: score,
                totalMarks: totalMarks,
                percentage: percentage.toFixed(2),
                passed: passed,
                passingPercentage: passingPercentage,
                createdAt: newResult.date ? new Date(newResult.date).toISOString() : new Date().toISOString()
            };

            const res = await addResult(resultData);
            
            if (res.data?.success) {
                showNotification('success', 'Result added successfully!');
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

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

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
                            <span>Admin Panel</span>
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
                                    {activeTab === 'dashboard' && 'Dashboard Overview'}
                                    {activeTab === 'results' && 'Assessment Results'}
                                    {activeTab === 'questions' && 'Question Bank'}
                                    {activeTab === 'settings' && 'System Settings'}
                                </h1>
                                <p className="institute-subtitle">
                                    Technical Skills Assessment System
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
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-question"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Questions</h3>
                                    <div className="stat-value">{stats.totalQuestions || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-clipboard-check"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Attempts</h3>
                                    <div className="stat-value">{stats.totalAttempts || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-trophy"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>Pass Rate</h3>
                                    <div className="stat-value">{stats.passRate || 0}%</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-section">
                            <h3>Quick Actions</h3>
                            <div className="action-buttons">
                                <button className="action-btn" onClick={() => setActiveTab('results')}>
                                    <i className="fas fa-clipboard-list"></i>
                                    View Results
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
                                                            <i className={`fas ${categories.find(c => c.id === result.category)?.icon || 'fa-question'}`}></i>
                                                            {result.category || 'General'}
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

                        <div className="questions-list">
                            {questions.length === 0 ? (
                                <div className="no-questions">
                                    <i className="fas fa-question-circle fa-3x"></i>
                                    <h3>No questions found</h3>
                                    <p>Click "Add Question" to start adding questions</p>
                                </div>
                            ) : (
                                questions.map((question, index) => {
                                    const categoryInfo = categories.find(c => c.id === question.category);
                                    return (
                                        <div key={question._id} className="question-card">
                                            <div className="question-header">
                                                <div className="question-meta">
                                                    <span className="question-number">Q{index + 1}</span>
                                                    <span className={`difficulty ${question.difficulty}`}>
                                                        <i className={`fas fa-signal ${question.difficulty === 'easy' ? 'text-success' : question.difficulty === 'medium' ? 'text-warning' : 'text-danger'}`}></i>
                                                        {question.difficulty}
                                                    </span>
                                                    <span className="category-tag">
                                                        <i className={`fas ${categoryInfo?.icon || 'fa-question'}`}></i>
                                                        {question.category}
                                                    </span>
                                                    <span className="marks">
                                                        <i className="fas fa-star"></i> {question.marks || 1} marks
                                                    </span>
                                                </div>
                                                <div className="question-actions">
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
                                            Current setting: {config.passingPercentage || 40}%
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
                                    </div>

                                    <button 
                                        className="btn primary save-btn"
                                        onClick={handleUpdateConfig}
                                    >
                                        <i className="fas fa-save"></i> Save Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Question Modal */}
            {showAddQuestion && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-question-circle"></i>
                                Add New Question
                            </h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
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
                                    value={newQuestion.questionText}
                                    onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
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
                                        value={newQuestion.category}
                                        onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                                        className="form-control"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                <i className={`fas ${cat.icon}`}></i> {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-signal"></i> Difficulty *
                                    </label>
                                    <select
                                        value={newQuestion.difficulty}
                                        onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                                        className="form-control"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-star"></i> Marks *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newQuestion.marks || 1}
                                        onChange={(e) => {
                                            const marks = parseInt(e.target.value) || 1;
                                            if (marks > 100) {
                                                showNotification('error', 'Marks cannot exceed 100');
                                                return;
                                            }
                                            setNewQuestion({...newQuestion, marks: marks});
                                        }}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fas fa-list-ul"></i> Options * (Select correct answer)
                                </label>
                                <div className="options-container">
                                    {newQuestion.options.map((option, index) => (
                                        <div key={index} className="option-input-group">
                                            <div className="option-letter">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                className="form-control"
                                            />
                                            <button
                                                className={`correct-toggle ${option.isCorrect ? 'active' : ''}`}
                                                onClick={() => handleCorrectAnswer(index)}
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
                                onClick={handleAddQuestion}
                            >
                                <i className="fas fa-plus"></i> Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                                <i className={`fas ${cat.icon}`}></i> {cat.name}
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
                                disabled={!newResult.name.trim() || !newResult.rollNumber.trim()}
                            >
                                <i className="fas fa-save"></i> Save Result
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;