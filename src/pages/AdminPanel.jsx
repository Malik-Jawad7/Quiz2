import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './AdminPanel.css';

// React Icons - ADD FaWrench icon
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaCog,
  FaChartBar,
  FaSync,
  FaSignOutAlt,
  FaSearch,
  FaTrash,
  FaUsers,
  FaQuestionCircle,
  FaChartLine,
  FaStar,
  FaUserGraduate,
  FaClipboardCheck,
  FaTimes,
  FaBars,
  FaCheck,
  FaUser,
  FaClock,
  FaPercentage,
  FaListOl,
  FaSave,
  FaIdCard,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDatabase,
  FaSpinner,
  FaEye,
  FaFilter,
  FaTag,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaCode,
  FaServer,
  FaDatabase as FaDb,
  FaGlobe,
  FaDocker,
  FaWrench  // ADDED for debug button
} from 'react-icons/fa';

// Import logo
import Logo from '../assets/shamsi-logo.jpg';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });

  // Categories list - Imported from Register page
  const [categories, setCategories] = useState([
    // ... (same categories array as before)
  ]);

  // Add Question State
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    questionText: '',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    marks: 1,
    difficulty: 'medium'
  });
  
  // Results and Questions states
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    todayAttempts: 0
  });
  
  // Filtered results for search
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Manage Questions states
  const [detailedViewQuestion, setDetailedViewQuestion] = useState(null);
  const [questionsSearchTerm, setQuestionsSearchTerm] = useState('');
  const [questionsSelectedCategory, setQuestionsSelectedCategory] = useState('all');
  const [questionsSelectedDifficulty, setQuestionsSelectedDifficulty] = useState('all');
  const [questionsPage, setQuestionsPage] = useState(1);
  const questionsPerPage = 10;

  // Load data on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      navigate('/admin/login');
    } else {
      loadAllData();
    }
  }, [navigate]);

  // Filter and sort results
  useEffect(() => {
    let filtered = results;
    
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => 
        result.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    filtered.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      }
      if (sortConfig.key === 'percentage') {
        return sortConfig.direction === 'asc' 
          ? (a.percentage || 0) - (b.percentage || 0)
          : (b.percentage || 0) - (a.percentage || 0);
      }
      if (sortConfig.key === 'submittedAt') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.submittedAt) - new Date(b.submittedAt)
          : new Date(b.submittedAt) - new Date(a.submittedAt);
      }
      return 0;
    });
    
    setFilteredResults(filtered);
  }, [results, searchTerm, selectedCategory, sortConfig]);

  // Load all data from API
  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load config
      const configResponse = await apiService.getConfig();
      if (configResponse.success) {
        setConfig(configResponse.config);
        localStorage.setItem('quizConfig', JSON.stringify(configResponse.config));
      }

      // Load stats
      const statsResponse = await apiService.getDashboardStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
      
      // Load questions
      const questionsResponse = await apiService.getAllQuestions();
      if (questionsResponse.success) {
        setQuestions(questionsResponse.questions || []);
      }
      
      // Load results
      const resultsResponse = await apiService.getResults();
      if (resultsResponse.success) {
        setResults(resultsResponse.results || []);
        setFilteredResults(resultsResponse.results || []);
      }
      
      // Load categories from API and merge with our predefined categories
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.success && categoriesResponse.categories) {
        // Merge API categories with our predefined categories
        const mergedCategories = [...categories];
        categoriesResponse.categories.forEach(apiCat => {
          const existingIndex = mergedCategories.findIndex(c => c.value === apiCat.value);
          if (existingIndex === -1) {
            // Add new category from API
            mergedCategories.push({
              value: apiCat.value,
              label: apiCat.label || apiCat.value,
              description: apiCat.description || apiCat.label || apiCat.value,
              available: true,
              type: getCategoryType(apiCat.value)
            });
          }
        });
        setCategories(mergedCategories);
      }
      
      showNotification('Data loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data: ' + error.message, 'error');
      
      // Set empty states
      setQuestions([]);
      setResults([]);
      setStats({
        totalStudents: 0,
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        todayAttempts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine category type
  const getCategoryType = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.type : 'general';
  };

  // Helper function to get type icon
  const getCategoryTypeIcon = (type) => {
    switch (type) {
      case 'frontend': return <FaCode />;
      case 'backend': return <FaServer />;
      case 'database': return <FaDb />;
      case 'fullstack': return <FaGlobe />;
      case 'devops': return <FaDocker />;
      default: return <FaCode />;
    }
  };

  // Helper function to get type color
  const getCategoryTypeColor = (type) => {
    switch (type) {
      case 'frontend': return '#3498db';
      case 'backend': return '#2ecc71';
      case 'database': return '#9b59b6';
      case 'fullstack': return '#e74c3c';
      case 'devops': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  // Delete single result
  const handleDeleteResult = async (resultId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}'s result? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiService.deleteResult(resultId);
      
      if (response.success) {
        const updatedResults = results.filter(r => r._id !== resultId);
        setResults(updatedResults);
        setFilteredResults(updatedResults.filter(r => r._id !== resultId));
        
        showNotification(`${studentName}'s result deleted successfully!`, 'success');
      } else {
        showNotification(response.message || 'Failed to delete result', 'error');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      showNotification('Error deleting result: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // View detailed question
  const handleViewQuestionDetails = (question) => {
    setDetailedViewQuestion(question);
    setActiveTab('question-detail');
  };

  // === FIXED: Add new question function ===
  const handleAddQuestion = async () => {
    // Validation
    if (!newQuestion.category.trim()) {
      showNotification('Please select a category', 'error');
      return;
    }
    
    if (!newQuestion.questionText.trim()) {
      showNotification('Please enter question text', 'error');
      return;
    }
    
    // Check options
    const validOptions = newQuestion.options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      showNotification('Please add at least 2 valid options', 'error');
      return;
    }
    
    // Check exactly one correct option
    const correctOptions = validOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      showNotification('Please select exactly one correct option', 'error');
      return;
    }

    setLoading(true);
    try {
      // Prepare question data - FIXED: Ensure proper boolean for isCorrect
      const questionData = {
        category: newQuestion.category,
        questionText: newQuestion.questionText.trim(),
        options: validOptions.map(opt => ({
          text: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect) // Force boolean conversion
        })),
        marks: parseInt(newQuestion.marks) || 1,
        difficulty: newQuestion.difficulty
      };
      
      console.log('📤 Sending question data to backend:');
      console.log('Question:', questionData.questionText.substring(0, 50));
      console.log('Options with isCorrect:');
      questionData.options.forEach((opt, idx) => {
        console.log(`  ${idx}: "${opt.text.substring(0, 20)}..." - isCorrect: ${opt.isCorrect} (type: ${typeof opt.isCorrect})`);
      });
      
      const response = await apiService.addQuestion(questionData);
      
      if (response.success) {
        // Reload questions
        await loadAllData();

        // Reset form
        setNewQuestion({
          category: '',
          questionText: '',
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
          marks: 1,
          difficulty: 'medium'
        });

        showNotification('Question added successfully!', 'success');
      } else {
        showNotification(response.message || 'Failed to add question', 'error');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      showNotification('Error: ' + (error.message || 'Failed to connect to server'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // === NEW: Debug questions function ===
  const debugQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllQuestions();
      if (response.success && response.questions) {
        console.log('=== DATABASE QUESTIONS DEBUG ===');
        console.log(`Total questions: ${response.questions.length}`);
        
        response.questions.forEach((q, idx) => {
          console.log(`\nQ${idx + 1}: ${q.questionText?.substring(0, 50)}...`);
          console.log(`Category: ${q.category}, Marks: ${q.marks}`);
          
          q.options?.forEach((opt, oIdx) => {
            console.log(`  Option ${oIdx}: "${opt.text?.substring(0, 30)}..."`);
            console.log(`    isCorrect: ${opt.isCorrect} (type: ${typeof opt.isCorrect})`);
            console.log(`    Raw value:`, opt);
          });
          
          // Check if any option is marked as correct
          const hasCorrect = q.options?.some(opt => 
            opt.isCorrect === true || 
            opt.isCorrect === 'true' ||
            String(opt.isCorrect).toLowerCase() === 'true'
          );
          
          if (!hasCorrect) {
            console.warn(`⚠️ WARNING: Q${idx + 1} has NO correct option marked!`);
          }
        });
        
        showNotification('Check console for question debug info', 'info');
      }
    } catch (error) {
      console.error('Debug error:', error);
      showNotification('Debug failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // === NEW: Fix existing questions function ===
  const fixQuestionCorrectOptions = async () => {
    if (!window.confirm('This will try to fix correct options for HTML questions. Continue?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiService.getAllQuestions();
      if (response.success && response.questions) {
        const htmlQuestions = response.questions.filter(q => q.category === 'html');
        
        console.log(`Found ${htmlQuestions.length} HTML questions to check`);
        
        // For each HTML question, we would update it
        // Note: You need to implement updateQuestion API for this to work
        // This is just a template
        
        for (const question of htmlQuestions) {
          console.log(`Checking: ${question.questionText.substring(0, 50)}...`);
          
          // Logic to determine correct answer based on question text
          let correctOptionIndex = -1;
          const questionText = question.questionText.toLowerCase();
          const options = question.options || [];
          
          options.forEach((opt, idx) => {
            const optionText = opt.text.toLowerCase();
            
            if (questionText.includes('image') && optionText.includes('<img>')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('html ka full form') && optionText.includes('hypertext markup language')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('line break') && optionText.includes('<br>')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('extension') && optionText.includes('.html')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('link') && optionText.includes('<a>')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('table') && optionText.includes('<table>')) {
              correctOptionIndex = idx;
            } else if ((questionText.includes('sabse badi') || questionText.includes('heading')) && optionText.includes('<h1>')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('ordered list') && optionText.includes('<ol>')) {
              correctOptionIndex = idx;
            } else if (questionText.includes('paragraph') && optionText.includes('<p>')) {
              correctOptionIndex = idx;
            }
          });
          
          if (correctOptionIndex !== -1) {
            console.log(`Would fix Q: ${question.questionText.substring(0, 30)}`);
            console.log(`Correct option should be: ${options[correctOptionIndex]?.text}`);
            // Here you would call updateQuestion API
          }
        }
        
        showNotification(`Checked ${htmlQuestions.length} HTML questions`, 'info');
      }
    } catch (error) {
      console.error('Fix questions error:', error);
      showNotification('Fix failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await apiService.deleteQuestion(questionId);
        
        if (response.success) {
          const updatedQuestions = questions.filter(q => q._id !== questionId);
          setQuestions(updatedQuestions);
          
          showNotification('Question deleted successfully!', 'success');
        } else {
          showNotification(response.message || 'Failed to delete question', 'error');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        showNotification('Error deleting question: ' + error.message, 'error');
      }
    }
  };

  // Add option field
  const addOption = () => {
    if (newQuestion.options.length < 4) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, { text: '', isCorrect: false }]
      });
    }
  };

  // Remove option field
  const removeOption = (index) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = [...newQuestion.options];
      updatedOptions.splice(index, 1);
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    }
  };

  // Update option text
  const updateOption = (index, text) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = text;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Set correct option
  const setCorrectOption = (index) => {
    const updatedOptions = newQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Update config
  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const response = await apiService.updateConfig(config);
      
      if (response.success) {
        localStorage.setItem('quizConfig', JSON.stringify(config));
        showNotification('Configuration updated successfully!', 'success');
      } else {
        showNotification(response.message || 'Failed to update config', 'error');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      showNotification('Error updating config: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete all results
  const handleDeleteAllResults = async () => {
    if (!window.confirm('Are you sure you want to delete ALL results permanently?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiService.deleteAllResults();
      
      if (response.success) {
        setResults([]);
        setFilteredResults([]);
        
        setStats(prevStats => ({
          ...prevStats,
          totalAttempts: 0,
          todayAttempts: 0,
          averageScore: 0,
          passRate: 0
        }));
        
        showNotification('All results deleted successfully!', 'success');
      } else {
        showNotification(response.message || 'Failed to delete all results', 'error');
      }
    } catch (error) {
      console.error('Error deleting all results:', error);
      showNotification('Error deleting all results: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sort results
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get filtered and sorted questions
  const getFilteredQuestions = () => {
    let filtered = [...questions];
    
    if (questionsSelectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === questionsSelectedCategory);
    }
    
    if (questionsSelectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === questionsSelectedDifficulty);
    }
    
    if (questionsSearchTerm) {
      const searchLower = questionsSearchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText.toLowerCase().includes(searchLower) ||
        (q.options && q.options.some(opt => 
          opt.text.toLowerCase().includes(searchLower)
        )) ||
        q.category.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  // Get paginated questions
  const getPaginatedQuestions = () => {
    const filtered = getFilteredQuestions();
    const startIndex = (questionsPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    
    return {
      paginatedQuestions: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / questionsPerPage),
      totalFiltered: filtered.length
    };
  };

  // Calculate question statistics
  const getQuestionStats = () => {
    const filtered = getFilteredQuestions();
    const totalQuestions = questions.length;
    
    return {
      total: filtered.length,
      categories: new Set(filtered.map(q => q.category)).size,
      easy: filtered.filter(q => q.difficulty === 'easy').length,
      medium: filtered.filter(q => q.difficulty === 'medium').length,
      hard: filtered.filter(q => q.difficulty === 'hard').length,
      totalMarks: filtered.reduce((total, q) => total + (q.marks || 1), 0),
      totalQuestions
    };
  };

  // Count questions per category
  const getQuestionCountByCategory = (categoryValue) => {
    return questions.filter(q => q.category === categoryValue).length;
  };

  // Render a question card
  const renderQuestionCard = (question, index) => {
    const isEven = index % 2 === 0;
    const categoryInfo = categories.find(c => c.value === question.category);
    const categoryType = categoryInfo ? categoryInfo.type : 'general';
    const typeColor = getCategoryTypeColor(categoryType);
    
    // Check if question has any correct option
    const hasCorrectOption = question.options?.some(opt => 
      opt.isCorrect === true || 
      opt.isCorrect === 'true' ||
      String(opt.isCorrect).toLowerCase() === 'true'
    );
    
    return (
      <div key={question._id || index} className={`question-card ${isEven ? 'even' : 'odd'} ${!hasCorrectOption ? 'no-correct' : ''}`}>
        <div className="question-card-header">
          <div className="question-meta">
            <div className="question-tags">
              <span className="question-tag tag-category" style={{ backgroundColor: typeColor + '20', color: typeColor }}>
                {getCategoryTypeIcon(categoryType)}
                {question.category || 'Uncategorized'}
              </span>
              <span className="question-tag tag-marks">
                {question.marks || 1} marks
              </span>
              <span className={`question-tag tag-difficulty ${question.difficulty || 'medium'}`}>
                {question.difficulty || 'medium'}
              </span>
              {!hasCorrectOption && (
                <span className="question-tag tag-warning" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                  <FaExclamationTriangle /> No correct option
                </span>
              )}
            </div>
            <div className="question-title">
              {question.questionText.length > 100 
                ? `${question.questionText.substring(0, 100)}...` 
                : question.questionText}
            </div>
          </div>
          
          <div className="question-card-actions">
            <button 
              className="action-btn-icon view"
              onClick={() => handleViewQuestionDetails(question)}
              title="View details"
            >
              <FaEye />
            </button>
            <button 
              className="action-btn-icon delete"
              onClick={() => handleDeleteQuestion(question._id)}
              disabled={loading}
              title="Delete question"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        <div className="question-card-body">
          <div className="question-text-preview">
            <p>{question.questionText}</p>
          </div>
          
          {question.options && question.options.length > 0 && (
            <div className="question-options-preview">
              {question.options.map((option, idx) => {
                const isCorrect = option.isCorrect === true || 
                                 option.isCorrect === 'true' ||
                                 String(option.isCorrect).toLowerCase() === 'true';
                
                return (
                  <div key={idx} className={`option-preview-item ${isCorrect ? 'correct' : ''}`}>
                    <div className="option-letter">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="option-text">
                      {option.text}
                    </div>
                    {isCorrect && (
                      <FaCheck className="correct-indicator" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="question-card-footer">
          <div className="question-id">
            ID: {question._id?.substring(0, 8) || 'N/A'}
          </div>
          <div className="question-date">
            <FaClock /> {formatDate(question.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  // Render stat card
  const renderStatCard = (title, value, icon, color = 'blue', subtitle = '') => {
    return (
      <div className="stat-card">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        <div className="stat-content">
          <h3>{value}</h3>
          <p>{title}</p>
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      </div>
    );
  };

  // Question Detail View
  const QuestionDetailView = () => {
    if (!detailedViewQuestion) {
      return (
        <div className="question-detail-view">
          <div className="section-header">
            <h2><FaEye /> Question Details</h2>
            <button 
              className="btn-secondary"
              onClick={() => setActiveTab('manage-questions')}
            >
              <FaArrowLeft /> Back to Questions
            </button>
          </div>
          <div className="no-data">No question selected</div>
        </div>
      );
    }
    
    const categoryInfo = categories.find(c => c.value === detailedViewQuestion.category);
    const categoryType = categoryInfo ? categoryInfo.type : 'general';
    const typeColor = getCategoryTypeColor(categoryType);
    const typeIcon = getCategoryTypeIcon(categoryType);
    
    return (
      <div className="question-detail-view">
        <div className="section-header">
          <h2><FaEye /> Question Details</h2>
          <button 
            className="btn-secondary"
            onClick={() => setActiveTab('manage-questions')}
          >
            <FaArrowLeft /> Back to Questions
          </button>
        </div>
        
        <div className="question-detail-card">
          <div className="detail-header">
            <div className="detail-meta">
              <div className="detail-category" style={{ color: typeColor }}>
                <strong>Category:</strong> {typeIcon} {detailedViewQuestion.category || 'Uncategorized'}
              </div>
              <div className="detail-marks">
                <strong>Marks:</strong> {detailedViewQuestion.marks || 1}
              </div>
              <div className={`detail-difficulty ${detailedViewQuestion.difficulty || 'medium'}`}>
                <strong>Difficulty:</strong> {detailedViewQuestion.difficulty || 'medium'}
              </div>
              <div className="detail-id">
                <strong>ID:</strong> {detailedViewQuestion._id?.substring(0, 12) || 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="detail-question">
            <h3>Question:</h3>
            <p>{detailedViewQuestion.questionText}</p>
          </div>
          
          <div className="detail-options">
            <h3>Options:</h3>
            <div className="options-list">
              {detailedViewQuestion.options && detailedViewQuestion.options.map((option, index) => {
                const isCorrect = option.isCorrect === true || 
                                 option.isCorrect === 'true' ||
                                 String(option.isCorrect).toLowerCase() === 'true';
                
                return (
                  <div 
                    key={index} 
                    className={`detail-option ${isCorrect ? 'correct-option' : ''}`}
                  >
                    <div className="option-header">
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option.text}</span>
                      {isCorrect && (
                        <span className="correct-badge">
                          <FaCheck /> Correct Answer
                        </span>
                      )}
                      <span className="option-correct-value">
                        (isCorrect: {String(option.isCorrect)}, type: {typeof option.isCorrect})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="detail-footer">
            <div className="detail-date">
              <strong>Created:</strong> {formatDate(detailedViewQuestion.createdAt)}
            </div>
            <div className="detail-actions">
              <button 
                className="btn-danger"
                onClick={() => {
                  handleDeleteQuestion(detailedViewQuestion._id);
                  setActiveTab('manage-questions');
                }}
              >
                <FaTrash /> Delete Question
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setActiveTab('manage-questions')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get question stats
  const questionStats = getQuestionStats();

  return (
    <div className="admin-panel">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className="mobile-logo">
          <div className="logo-placeholder">
            <img src={Logo} alt="Shamsi Institute" className="logo-img" />
          </div>
          <div className="mobile-title">
            <span>Admin Panel</span>
            <span>Shamsi Institute</span>
          </div>
        </div>
        
        <button 
          className="mobile-refresh"
          onClick={loadAllData}
          disabled={loading}
        >
          {loading ? <FaSpinner className="spinning" /> : <FaSync />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-img-container">
              <img src={Logo} alt="Shamsi Institute" className="logo-img" />
            </div>
            <div className="logo-text">
              <h2>Shamsi Institute</h2>
              <p>Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('dashboard'); 
              setMobileMenuOpen(false); 
            }}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'add-question' ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('add-question'); 
              setMobileMenuOpen(false); 
            }}
          >
            <FaPlusCircle />
            <span>Add Question</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'manage-questions' ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('manage-questions'); 
              setMobileMenuOpen(false); 
            }}
          >
            <FaEdit />
            <span>Manage Questions</span>
            {questions.length > 0 && (
              <span className="nav-badge">{questions.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('results'); 
              setMobileMenuOpen(false); 
            }}
          >
            <FaChartBar />
            <span>Results</span>
            {results.length > 0 && (
              <span className="nav-badge">{results.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('config'); 
              setMobileMenuOpen(false); 
            }}
          >
            <FaCog />
            <span>Configuration</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            onClick={loadAllData} 
            className="refresh-all-btn" 
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinning" /> : <FaSync />}
            <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
          
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>
            {activeTab === 'dashboard' && <><FaTachometerAlt /> Dashboard</>}
            {activeTab === 'add-question' && <><FaPlusCircle /> Add Question</>}
            {activeTab === 'manage-questions' && <><FaEdit /> Manage Questions</>}
            {activeTab === 'config' && <><FaCog /> Configuration</>}
            {activeTab === 'results' && <><FaChartBar /> Results</>}
            {activeTab === 'question-detail' && <><FaEye /> Question Details</>}
          </h1>
          
          <div className="top-bar-actions">
            <div className="welcome-message">
              Welcome, <strong>Admin</strong>
            </div>
            <button 
              className="refresh-btn" 
              onClick={loadAllData} 
              disabled={loading}
            >
              {loading ? <FaSpinner className="spinning" /> : <FaSync />} 
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2><FaTachometerAlt /> Dashboard Overview</h2>
              <div className="dashboard-actions">
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('add-question')}
                >
                  <FaPlusCircle /> Add Question
                </button>
                <button 
                  className="btn-secondary"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSync />} 
                  Refresh Data
                </button>
                {/* Debug button */}
                <button 
                  className="btn-warning"
                  onClick={debugQuestions}
                  disabled={loading}
                >
                  <FaWrench /> Debug Questions
                </button>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              {renderStatCard('Total Students', stats.totalStudents || 0, <FaUsers />, 'blue')}
              {renderStatCard('Total Questions', stats.totalQuestions || 0, <FaQuestionCircle />, 'green')}
              {renderStatCard('Total Attempts', stats.totalAttempts || 0, <FaClipboardCheck />, 'orange')}
              {renderStatCard('Average Score', `${(stats.averageScore || 0).toFixed(1)}%`, <FaChartLine />, 'purple')}
              {renderStatCard('Pass Rate', `${(stats.passRate || 0).toFixed(1)}%`, <FaStar />, 'yellow')}
              {renderStatCard("Today's Attempts", stats.todayAttempts || 0, <FaUserGraduate />, 'red')}
            </div>

            {/* Quick Summary */}
            <div className="quick-summary">
              <div className="summary-card">
                <h3><FaDatabase /> System Summary</h3>
                <div className="summary-content">
                  <div className="summary-item">
                    <span>Questions in DB:</span>
                    <span>{questions.length}</span>
                  </div>
                  <div className="summary-item">
                    <span>Results in DB:</span>
                    <span>{results.length}</span>
                  </div>
                  <div className="summary-item">
                    <span>Categories:</span>
                    <span>{categories.length}</span>
                  </div>
                  <div className="summary-item">
                    <span>Questions with issues:</span>
                    <span>
                      {questions.filter(q => !q.options?.some(opt => 
                        opt.isCorrect === true || 
                        opt.isCorrect === 'true' ||
                        String(opt.isCorrect).toLowerCase() === 'true'
                      )).length}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <h3><FaClock /> Quiz Settings</h3>
                <div className="summary-content">
                  <div className="summary-item">
                    <span>Quiz Time:</span>
                    <span>{config.quizTime} minutes</span>
                  </div>
                  <div className="summary-item">
                    <span>Passing %:</span>
                    <span>{config.passingPercentage}%</span>
                  </div>
                  <div className="summary-item">
                    <span>Questions per Quiz:</span>
                    <span>{config.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Overview */}
            <div className="categories-overview">
              <h3><FaListOl /> Categories Overview</h3>
              <div className="categories-list">
                {categories.slice(0, 8).map((category) => {
                  const questionCount = getQuestionCountByCategory(category.value);
                  const typeIcon = getCategoryTypeIcon(category.type);
                  const typeColor = getCategoryTypeColor(category.type);
                  
                  return (
                    <div key={category.value} className="category-overview-card">
                      <div className="category-overview-header">
                        <div className="category-type-icon" style={{ color: typeColor }}>
                          {typeIcon}
                        </div>
                        <h4>{category.label}</h4>
                      </div>
                      <div className="category-overview-content">
                        <div className="category-description">
                          {category.description}
                        </div>
                        <div className="category-stats">
                          <span className="question-count">
                            {questionCount} question{questionCount !== 1 ? 's' : ''}
                          </span>
                          <span className="category-type" style={{ backgroundColor: typeColor + '20', color: typeColor }}>
                            {category.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {categories.length > 8 && (
                <div className="more-categories">
                  <p>And {categories.length - 8} more categories...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Question Tab */}
        {activeTab === 'add-question' && (
          <div className="add-question">
            <div className="section-header">
              <h2><FaPlusCircle /> Add New Question</h2>
              <button 
                className="btn-secondary"
                onClick={() => setActiveTab('manage-questions')}
              >
                <FaEye /> View All Questions
              </button>
            </div>
            
            <div className="add-question-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => {
                      const questionCount = getQuestionCountByCategory(category.value);
                      const typeIcon = getCategoryTypeIcon(category.type);
                      const typeColor = getCategoryTypeColor(category.type);
                      
                      return (
                        <option key={category.value} value={category.value}>
                          <span style={{ color: typeColor }}>
                            {category.label} ({questionCount})
                          </span>
                        </option>
                      );
                    })}
                  </select>
                  <small>Select technology category from {categories.length} available categories</small>
                </div>
                
                <div className="form-group">
                  <label>Marks *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newQuestion.marks}
                    onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})}
                    required
                  />
                  <small>1-10 marks per question</small>
                </div>
                
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Question Text *</label>
                <textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                  placeholder="Enter your question here..."
                  rows="3"
                  required
                />
                <small className="form-hint">
                  <FaExclamationTriangle /> IMPORTANT: Make sure question text clearly indicates the correct answer
                </small>
              </div>
              
              <div className="form-group full-width">
                <label>Options *</label>
                <div className="options-container">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="option-input-group">
                      <div className="option-input">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                        {newQuestion.options.length > 2 && (
                          <button 
                            type="button" 
                            className="remove-option-btn"
                            onClick={() => removeOption(index)}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      <div className="option-actions">
                        <label className="correct-checkbox">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={option.isCorrect}
                            onChange={() => setCorrectOption(index)}
                          />
                          <span className="correct-label">
                            <FaCheckCircle /> Correct Answer
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {newQuestion.options.length < 4 && (
                    <button 
                      type="button" 
                      className="add-option-btn"
                      onClick={addOption}
                    >
                      <FaPlus /> Add Option
                    </button>
                  )}
                </div>
                <small className="form-hint">
                  <FaExclamationTriangle /> CRITICAL: Select EXACTLY ONE correct option. 
                  This will be saved as <code>isCorrect: true</code> in database.
                </small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleAddQuestion}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSave />} 
                  {loading ? 'Saving...' : 'Save Question'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setNewQuestion({
                      category: '',
                      questionText: '',
                      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                      marks: 1,
                      difficulty: 'medium'
                    });
                  }}
                >
                  Clear Form
                </button>
                <button 
                  type="button" 
                  className="btn-info"
                  onClick={debugQuestions}
                  disabled={loading}
                >
                  <FaWrench /> Debug Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Questions Tab */}
        {activeTab === 'manage-questions' && (
          <div className="manage-questions-container">
            <div className="manage-header-section">
              <div className="header-content">
                <div className="header-title">
                  <h1><FaEdit /> Manage Questions</h1>
                  <span className="question-count-badge">
                    {questions.length} Question{questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="header-actions">
                  <button 
                    className="btn-add-question"
                    onClick={() => setActiveTab('add-question')}
                  >
                    <FaPlusCircle /> Add New Question
                  </button>
                  
                  <button 
                    className={`btn-refresh-questions ${loading ? 'loading' : ''}`}
                    onClick={loadAllData}
                    disabled={loading}
                  >
                    {loading ? <FaSpinner className="spinning" /> : <FaSync />}
                  </button>
                  
                  <button 
                    className="btn-debug-questions"
                    onClick={debugQuestions}
                    disabled={loading}
                    title="Debug Questions in Console"
                  >
                    <FaWrench />
                  </button>
                </div>
              </div>
              
              <div className="quick-stats">
                <div className="stat-item-small">
                  <div className="label">
                    <FaQuestionCircle /> Total Questions
                  </div>
                  <div className="value">{questionStats.totalQuestions}</div>
                </div>
                
                <div className="stat-item-small">
                  <div className="label">
                    <FaListOl /> Categories
                  </div>
                  <div className="value">{questionStats.categories}</div>
                </div>
                
                <div className="stat-item-small">
                  <div className="label">
                    <FaChartBar /> Easy Questions
                  </div>
                  <div className="value">{questionStats.easy}</div>
                </div>
                
                <div className="stat-item-small warning">
                  <div className="label">
                    <FaExclamationTriangle /> Issues
                  </div>
                  <div className="value">
                    {questions.filter(q => !q.options?.some(opt => 
                      opt.isCorrect === true || 
                      opt.isCorrect === 'true' ||
                      String(opt.isCorrect).toLowerCase() === 'true'
                    )).length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="manage-main-content">
              <div className="search-filter-section">
                <div className="search-container">
                  <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search questions by text, options, or category..."
                      value={questionsSearchTerm}
                      onChange={(e) => {
                        setQuestionsSearchTerm(e.target.value);
                        setQuestionsPage(1);
                      }}
                    />
                    {questionsSearchTerm && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => setQuestionsSearchTerm('')}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="filter-controls">
                  <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <select
                      className="filter-select"
                      value={questionsSelectedCategory}
                      onChange={(e) => {
                        setQuestionsSelectedCategory(e.target.value);
                        setQuestionsPage(1);
                      }}
                    >
                      <option value="all">All Categories ({questions.length})</option>
                      {categories.map(category => {
                        const count = getQuestionCountByCategory(category.value);
                        if (count > 0) {
                          const typeIcon = getCategoryTypeIcon(category.type);
                          const typeColor = getCategoryTypeColor(category.type);
                          
                          return (
                            <option key={category.value} value={category.value}>
                              {category.label} ({count})
                            </option>
                          );
                        }
                        return null;
                      }).filter(Boolean)}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Difficulty</label>
                    <div className="difficulty-filter">
                      <button 
                        className={`difficulty-btn ${questionsSelectedDifficulty === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setQuestionsSelectedDifficulty('all');
                          setQuestionsPage(1);
                        }}
                      >
                        All ({questions.length})
                      </button>
                      <button 
                        className={`difficulty-btn easy ${questionsSelectedDifficulty === 'easy' ? 'active' : ''}`}
                        onClick={() => {
                          setQuestionsSelectedDifficulty('easy');
                          setQuestionsPage(1);
                        }}
                      >
                        Easy ({questionStats.easy})
                      </button>
                      <button 
                        className={`difficulty-btn medium ${questionsSelectedDifficulty === 'medium' ? 'active' : ''}`}
                        onClick={() => {
                          setQuestionsSelectedDifficulty('medium');
                          setQuestionsPage(1);
                        }}
                      >
                        Medium ({questionStats.medium})
                      </button>
                      <button 
                        className={`difficulty-btn hard ${questionsSelectedDifficulty === 'hard' ? 'active' : ''}`}
                        onClick={() => {
                          setQuestionsSelectedDifficulty('hard');
                          setQuestionsPage(1);
                        }}
                      >
                        Hard ({questionStats.hard})
                      </button>
                    </div>
                  </div>
                  
                  <div className="filter-actions">
                    <button 
                      className="btn-clear-filters"
                      onClick={() => {
                        setQuestionsSearchTerm('');
                        setQuestionsSelectedCategory('all');
                        setQuestionsSelectedDifficulty('all');
                        setQuestionsPage(1);
                      }}
                    >
                      <FaTimes /> Clear Filters
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="results-info-bar">
                <div className="results-info">
                  <div className="results-count">
                    Showing <strong>{getPaginatedQuestions().paginatedQuestions.length}</strong> of{' '}
                    <strong>{questionStats.total}</strong> questions
                  </div>
                  {questionsSearchTerm && (
                    <div className="search-indicator">
                      <FaSearch /> Searching: "{questionsSearchTerm}"
                    </div>
                  )}
                  {questionsSelectedCategory !== 'all' && (
                    <div className="search-indicator">
                      <FaFilter /> Category: {questionsSelectedCategory}
                    </div>
                  )}
                  {questionsSelectedDifficulty !== 'all' && (
                    <div className="search-indicator">
                      <FaFilter /> Difficulty: {questionsSelectedDifficulty}
                    </div>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Loading questions...</div>
                </div>
              ) : getPaginatedQuestions().paginatedQuestions.length === 0 ? (
                <div className="empty-state-container">
                  <FaQuestionCircle className="empty-state-icon" />
                  <h2 className="empty-state-title">
                    {questionsSearchTerm || questionsSelectedCategory !== 'all' || questionsSelectedDifficulty !== 'all'
                      ? 'No matching questions found' 
                      : 'No questions available'}
                  </h2>
                  <p className="empty-state-message">
                    {questionsSearchTerm || questionsSelectedCategory !== 'all' || questionsSelectedDifficulty !== 'all'
                      ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                      : 'Get started by adding your first question to the database.'}
                  </p>
                  <div className="empty-state-actions">
                    <button 
                      className="btn-add-first"
                      onClick={() => setActiveTab('add-question')}
                    >
                      <FaPlusCircle /> Add Your First Question
                    </button>
                    {(questionsSearchTerm || questionsSelectedCategory !== 'all' || questionsSelectedDifficulty !== 'all') && (
                      <button 
                        className="btn-clear-search"
                        onClick={() => {
                          setQuestionsSearchTerm('');
                          setQuestionsSelectedCategory('all');
                          setQuestionsSelectedDifficulty('all');
                        }}
                      >
                        <FaTimes /> Clear Search
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="questions-grid-view">
                  {getPaginatedQuestions().paginatedQuestions.map((question, index) => 
                    renderQuestionCard(question, index)
                  )}
                </div>
              )}
              
              {getPaginatedQuestions().totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Page {questionsPage} of {getPaginatedQuestions().totalPages} • 
                    Showing {Math.min(questionsPerPage, getPaginatedQuestions().paginatedQuestions.length)} questions per page
                  </div>
                  
                  <div className="pagination-controls">
                    <button 
                      className="pagination-btn"
                      onClick={() => setQuestionsPage(prev => Math.max(1, prev - 1))}
                      disabled={questionsPage === 1}
                    >
                      <FaArrowLeft /> Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: Math.min(5, getPaginatedQuestions().totalPages) }, (_, i) => {
                        let pageNum;
                        if (getPaginatedQuestions().totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (questionsPage <= 3) {
                          pageNum = i + 1;
                        } else if (questionsPage >= getPaginatedQuestions().totalPages - 2) {
                          pageNum = getPaginatedQuestions().totalPages - 4 + i;
                        } else {
                          pageNum = questionsPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`page-number ${pageNum === questionsPage ? 'active' : ''}`}
                            onClick={() => setQuestionsPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {getPaginatedQuestions().totalPages > 5 && questionsPage < getPaginatedQuestions().totalPages - 2 && (
                        <>
                          <span className="page-dots">...</span>
                          <button
                            className="page-number"
                            onClick={() => setQuestionsPage(getPaginatedQuestions().totalPages)}
                          >
                            {getPaginatedQuestions().totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button 
                      className="pagination-btn"
                      onClick={() => setQuestionsPage(prev => Math.min(getPaginatedQuestions().totalPages, prev + 1))}
                      disabled={questionsPage === getPaginatedQuestions().totalPages}
                    >
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Detail Tab */}
        {activeTab === 'question-detail' && <QuestionDetailView />}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="results-page">
            <div className="section-header">
              <h2><FaChartBar /> Quiz Results ({filteredResults.length})</h2>
              <div className="section-actions">
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAllResults}
                  disabled={results.length === 0 || loading}
                >
                  <FaTrash /> Delete All Results
                </button>
                <button 
                  className="btn-primary"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSync />} Refresh
                </button>
              </div>
            </div>
            
            <div className="results-controls">
              <div className="search-filter">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search by name, roll number, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-dropdown">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => {
                      const count = results.filter(r => r.category === category.value).length;
                      const typeIcon = getCategoryTypeIcon(category.type);
                      
                      return (
                        <option key={category.value} value={category.value}>
                          {category.label} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>
                      <span>Student {getSortIcon('name')}</span>
                    </th>
                    <th><FaIdCard /> Roll No</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th onClick={() => requestSort('percentage')}>
                      <span>Percentage {getSortIcon('percentage')}</span>
                    </th>
                    <th>Status</th>
                    <th><FaHistory /> Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state">
                          <FaSearch className="empty-state-icon" />
                          <h3>No Results Found</h3>
                          <p>No quiz results available</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((result) => {
                      const percentage = parseFloat(result.percentage) || 0;
                      const passed = percentage >= config.passingPercentage;
                      const categoryInfo = categories.find(c => c.value === result.category);
                      const categoryType = categoryInfo ? categoryInfo.type : 'general';
                      const typeColor = getCategoryTypeColor(categoryType);
                      const typeIcon = getCategoryTypeIcon(categoryType);
                      
                      return (
                        <tr key={result._id} className={passed ? 'passed-row' : 'failed-row'}>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar">
                                <FaUser />
                              </div>
                              <div>
                                <div className="student-name">{result.name || 'Student'}</div>
                                <div className="roll-number">{result.rollNumber || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>{result.rollNumber || 'N/A'}</td>
                          <td>
                            <span className="table-category-badge" style={{ backgroundColor: typeColor + '20', color: typeColor }}>
                              {typeIcon} {result.category || 'General'}
                            </span>
                          </td>
                          <td><strong>{result.score || 0}</strong></td>
                          <td>
                            <span className={`percentage ${passed ? 'pass' : 'fail'}`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${passed ? 'pass' : 'fail'}`}>
                              {passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td>{formatDate(result.submittedAt)}</td>
                          <td>
                            <div className="result-actions">
                              <button 
                                className="delete-result-btn"
                                onClick={() => handleDeleteResult(result._id, result.name || 'Student')}
                                disabled={loading}
                                title="Delete this result"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="results-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span>Total Results:</span>
                  <strong>{results.length}</strong>
                </div>
                <div className="stat-item">
                  <span>Passed:</span>
                  <strong>{results.filter(r => parseFloat(r.percentage) >= config.passingPercentage).length}</strong>
                </div>
                <div className="stat-item">
                  <span>Failed:</span>
                  <strong>{results.filter(r => parseFloat(r.percentage) < config.passingPercentage).length}</strong>
                </div>
                <div className="stat-item">
                  <span>Pass Rate:</span>
                  <strong>{results.length > 0 
                    ? ((results.filter(r => parseFloat(r.percentage) >= config.passingPercentage).length / results.length) * 100).toFixed(1)
                    : 0}%</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="config-page">
            <div className="section-header">
              <h2><FaCog /> System Configuration</h2>
              <button 
                className="btn-primary"
                onClick={handleUpdateConfig}
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinning" /> : <FaSave />} 
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
            
            <div className="config-grid">
              <div className="config-card">
                <div className="config-icon">
                  <FaClock />
                </div>
                <div className="config-content">
                  <h3>Quiz Time Limit</h3>
                  <p>Set the maximum time allowed for each quiz attempt</p>
                  <div className="config-input">
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={config.quizTime}
                      onChange={(e) => setConfig({...config, quizTime: parseInt(e.target.value)})}
                    />
                    <span className="config-value">{config.quizTime} minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="config-card">
                <div className="config-icon">
                  <FaPercentage />
                </div>
                <div className="config-content">
                  <h3>Passing Percentage</h3>
                  <p>Minimum percentage required to pass the quiz</p>
                  <div className="config-input">
                    <input
                      type="range"
                      min="30"
                      max="100"
                      step="5"
                      value={config.passingPercentage}
                      onChange={(e) => setConfig({...config, passingPercentage: parseInt(e.target.value)})}
                    />
                    <span className="config-value">{config.passingPercentage}%</span>
                  </div>
                </div>
              </div>
              
              <div className="config-card">
                <div className="config-icon">
                  <FaListOl />
                </div>
                <div className="config-content">
                  <h3>Questions per Quiz</h3>
                  <p>Number of questions in each quiz attempt</p>
                  <div className="config-input">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={config.totalQuestions}
                      onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
                    />
                    <span className="config-value">{config.totalQuestions} questions</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Debug Section in Config */}
            <div className="debug-section">
              <h3><FaWrench /> Debug Tools</h3>
              <div className="debug-buttons">
                <button 
                  className="btn-info"
                  onClick={debugQuestions}
                  disabled={loading}
                >
                  <FaWrench /> Debug Questions in Console
                </button>
                <button 
                  className="btn-warning"
                  onClick={fixQuestionCorrectOptions}
                  disabled={loading}
                >
                  <FaExclamationTriangle /> Fix HTML Questions (Experimental)
                </button>
              </div>
              <p className="debug-note">
                <FaInfoCircle /> Use these tools to diagnose and fix question issues. Check browser console for detailed output.
              </p>
            </div>
            
            {/* Categories Overview in Config */}
            <div className="categories-config">
              <h3><FaListOl /> Available Categories ({categories.length})</h3>
              <div className="categories-list-config">
                <div className="categories-grid-config">
                  {categories.map((category, index) => {
                    const questionCount = getQuestionCountByCategory(category.value);
                    const typeIcon = getCategoryTypeIcon(category.type);
                    const typeColor = getCategoryTypeColor(category.type);
                    
                    return (
                      <div key={category.value} className="category-item-config">
                        <div className="category-header-config">
                          <div className="category-type-config" style={{ backgroundColor: typeColor + '20', color: typeColor }}>
                            {typeIcon} {category.type}
                          </div>
                          <div className="question-count-config">
                            {questionCount} Q
                          </div>
                        </div>
                        <div className="category-name-config">
                          <h4>{category.label}</h4>
                          <p className="category-desc-config">{category.description}</p>
                        </div>
                        <div className="category-value-config">
                          <code>{category.value}</code>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {notification.type === 'success' ? <FaCheckCircle /> : 
               notification.type === 'error' ? <FaTimesCircle /> : 
               notification.type === 'warning' ? <FaExclamationTriangle /> : <FaInfoCircle />}
            </span>
            <span>{notification.message}</span>
          </div>
          <button 
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;