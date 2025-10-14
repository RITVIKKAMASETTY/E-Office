import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight, Plus, X, LogOut, User, Search, Filter, Calendar, Users, Target } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_URL;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

const TeamLeadDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('subtasks');
  const [subTasks, setSubTasks] = useState([]);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [individualTasks, setIndividualTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadMessage, setUploadMessage] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [expandedSubTasks, setExpandedSubTasks] = useState({});
  const [authError, setAuthError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [taskDocuments, setTaskDocuments] = useState({});
  const [documentDescriptions, setDocumentDescriptions] = useState({});
  const [showDocumentUpload, setShowDocumentUpload] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_Date: '',
    priority: 'medium',
    status: 'pending'
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }

    console.log('Token found, length:', token.length);
    
    return {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('userData');
      
      if (!token || !userDataStr) {
        console.error('Missing authentication data');
        window.location.href = '/login';
        return;
      }

      try {
        const parsedUser = JSON.parse(userDataStr);
        console.log('User data:', parsedUser);
        console.log('Token exists:', !!token);
        
        if (parsedUser.role !== 'Team Leader') {
          const roleRoutes = {
            admin: '/dashboard/admin',
            manager: '/dashboard/manager',
            member: '/dashboard/member',
            teamleader: '/dashboard/teamlead'
          };
          const userRole = parsedUser.role === "Team Leader" ? "teamleader" : parsedUser.role.toLowerCase();
          window.location.href = roleRoutes[userRole] || '/dashboard';
          return;
        }
        setUserData(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = '/login';
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('department');
    window.location.href = '/login';
  };

  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      console.error('Authentication failed:', response.status);
      setAuthError('Session expired. Please login again.');
      setTimeout(() => {
        handleLogout();
      }, 2000);
      return true;
    }
    return false;
  };

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ipfsHash: data.IpfsHash,
          fileName: file.name,
          fileSize: file.size,
        };
      }
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
    }
    return null;
  };

  const fetchSubTasks = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setAuthError('Authentication token not found. Please login again.');
        setTimeout(() => handleLogout(), 2000);
        setLoading(false);
        return;
      }

      console.log('Fetching sub-tasks from:', `${API_BASE_URL}/sub-tasks/`);
      
      const response = await fetch(`${API_BASE_URL}/sub-tasks/`, {
        method: 'GET',
        headers: headers
      });

      console.log('Sub-tasks response status:', response.data, response.status, response.statusText );

      if (handleAuthError(response)) {
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Sub-tasks data received:', data);
        setSubTasks(Array.isArray(data) ? data : []);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        console.log(`Failed to fetch sub-tasks: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
      console.log(`Network error: ${error.message}`);
    }
    setLoading(false);
  };

  const fetchSubTaskDocuments = async (subTaskId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return [];

      console.log('Fetching documents for subtask:', subTaskId);
      const response = await fetch(`${API_BASE_URL}/sub-tasks/subtask-documents/`, {
        headers: headers
      });

      if (handleAuthError(response)) return [];

      if (response.ok) {
        const allDocs = await response.json();
        console.log('All subtask documents:', allDocs);
        const filteredDocs = Array.isArray(allDocs) ? allDocs.filter(doc => doc.task === subTaskId) : [];
        console.log('Filtered documents for subtask', subTaskId, ':', filteredDocs);
        return filteredDocs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching sub-task documents:', error);
      return [];
    }
  };

  const fetchIndividualTasksBySubTask = async (subTaskId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/individual-tasks/subtask/${subTaskId}/`, {
        headers: headers
      });

      if (handleAuthError(response)) return;

      if (response.ok) {
        const data = await response.json();
        setIndividualTasks(Array.isArray(data) ? data : []);
        
        for (const task of data) {
          await fetchIndividualTaskDocuments(task.id);
        }
      }
    } catch (error) {
      console.error('Error fetching individual tasks:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/teams/members/`, {
        headers: headers
      });

      if (handleAuthError(response)) return;

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchIndividualTaskDocuments = async (taskId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/individual-task-documents/task/${taskId}/`, {
        headers: headers
      });

      if (handleAuthError(response)) return;

      if (response.ok) {
        const data = await response.json();
        setTaskDocuments(prev => ({
          ...prev,
          [taskId]: Array.isArray(data) ? data : []
        }));
      }
    } catch (error) {
      console.error('Error fetching task documents:', error);
    }
  };

  const uploadSubTaskDocument = async (subTaskId, file, description) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

      const pinataResult = await uploadToPinata(file);
      if (!pinataResult) throw new Error('Pinata upload failed');

      const pinataUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.ipfsHash}`;

      setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

    const response = await fetch(`${API_BASE_URL}/sub-tasks/subtask-documents/`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        task: subTaskId,
        file: pinataUrl,
        description: description || '',
      }),
    });

      console.log('Upload response:', response.status, response.statusText);

      try {
        const data = await response.json();
        console.log('Upload response data:', data);
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        const text = await response.text();
        console.log('Raw response text:', text);
      }

      if (handleAuthError(response)) {
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        });
        return;
      }

      if (response.ok) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setTimeout(() => setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        }), 2000);

      const docs = await fetchSubTaskDocuments(subTaskId);
      setDocuments(docs);
      setDocumentDescriptions(prev => ({ ...prev, [subTaskId]: '' }));
      setShowDocumentUpload(prev => ({ ...prev, [subTaskId]: false }));
      return await response.json();
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[file.name];
      return updated;
    });
  }
};

  const uploadTaskDocument = async (taskId, file) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

      const pinataResult = await uploadToPinata(file);
      if (!pinataResult) throw new Error('Pinata upload failed');

      setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

      const response = await fetch(`${API_BASE_URL}/individual-tasks/individual-task-documents/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          task_id: taskId,
          name: pinataResult.fileName,
          ipfs_hash: pinataResult.ipfsHash,
          file_size: pinataResult.fileSize,
        })
      });

      if (handleAuthError(response)) {
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        });
        return;
      }

      if (response.ok) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setTimeout(() => setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        }), 2000);
        return await response.json();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });
    }
  };

  const createIndividualTask = async () => {
    if (!selectedSubTask) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      console.log("Creating individual task with data:", {
        ...newTask,
        sub_task: selectedSubTask?.id,
      });

      const response = await fetch(`${API_BASE_URL}/individual-tasks/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ...newTask,
          sub_task: selectedSubTask.title,
        }),
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Response body:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (handleAuthError(response)) return;

      if (response.ok) {
        console.log("Task created successfully:", responseData);
        setIndividualTasks([...individualTasks, responseData]);
        setShowCreateTask(false);
        setNewTask({
          title: '',
          description: '',
          assigned_to: '',
          due_date: '',
          status: 'pending',
          sub_task: selectedSubTask.id,
        });
      } else {
        console.error("Failed to create task:", response.status, responseData);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchSubTasks();
      fetchTeamMembers();
    }
  }, [userData]);

  const toggleSubTask = async (subTask) => {
    const isExpanded = expandedSubTasks[subTask.id];
    setExpandedSubTasks({ ...expandedSubTasks, [subTask.id]: !isExpanded });
    
    if (!isExpanded) {
      setSelectedSubTask(subTask);
      await fetchIndividualTasksBySubTask(subTask.id);
      const docs = await fetchSubTaskDocuments(subTask.id);
      setDocuments(docs);
    }
  };

  const handleFileUpload = async (e, type, id) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (type === 'subtask') {
        await uploadSubTaskDocument(id, file, documentDescriptions[id] || '');
      } else {
        await uploadTaskDocument(id, file);
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredSubTasks = subTasks.filter(task => 
    task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(task => 
    statusFilter === 'all' || task.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Team Lead Dashboard</h1>
                <p className="text-sm text-gray-500">Manage tasks and assignments</p>
              </div>
            </div>

            {userData && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{userData.name || userData.email || userData.username}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Team Lead</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Error Alert */}
      {authError && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Authentication Error</h3>
              <p className="text-sm text-red-700 mt-1">{authError}</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6">
        {!userData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Sub-Tasks
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {subTasks.length}
                  </span>
                </h2>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredSubTasks.length > 0 ? (
                    filteredSubTasks.map(subTask => (
                      <div 
                        key={subTask.id} 
                        className={`border rounded-xl transition-all duration-200 ${
                          selectedSubTask?.id === subTask.id 
                            ? 'border-blue-600 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleSubTask(subTask)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1 min-w-0">
                              {expandedSubTasks[subTask.id] ? (
                                <ChevronDown className="w-4 h-4 mr-3 mt-1 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-3 mt-1 text-gray-500 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                                  {subTask.name || `Sub-Task #${subTask.id}`}
                                </h3>
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                  {subTask.description?.substring(0, 80)}...
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subTask.status)}`}>
                                    {subTask.status?.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {expandedSubTasks[subTask.id] && (
                          <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-3 rounded-b-xl">
                            {!showDocumentUpload[subTask.id] ? (
                              <button
                                onClick={() => setShowDocumentUpload(prev => ({ ...prev, [subTask.id]: true }))}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Document
                              </button>
                            ) : (
                              <div className="space-y-3">
                                <textarea
                                  placeholder="Enter document description..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                                  rows="2"
                                  value={documentDescriptions[subTask.id] || ''}
                                  onChange={(e) => setDocumentDescriptions(prev => ({ ...prev, [subTask.id]: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                  <label className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm font-medium">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                    <input
                                      type="file"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, 'subtask', subTask.id)}
                                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                    />
                                  </label>
                                  <button
                                    onClick={() => {
                                      setShowDocumentUpload(prev => ({ ...prev, [subTask.id]: false }));
                                      setDocumentDescriptions(prev => ({ ...prev, [subTask.id]: '' }));
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No sub-tasks found</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedSubTask ? (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Documents</h2>
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map(doc => (
                          <div 
                            key={doc.id} 
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => window.open(doc.file, '_blank')}
                          >
                            <FileText className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-blue-600 hover:text-blue-800 truncate">{doc.description || 'Document'}</p>
                              <p className="text-sm text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                        <p className="text-gray-600 text-sm max-w-sm mx-auto">
                          Upload documents to keep track of important files related to this sub-task.
                        </p>
                      </div>
                    )}
                    
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-medium text-gray-800">Upload Progress</h4>
                        {Object.entries(uploadProgress).map(([name, progress]) => (
                          <div key={name} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-800 truncate">{name}</span>
                              <span className="font-semibold text-blue-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Individual Tasks ({individualTasks.length})</h2>
                      <button
                        onClick={() => setShowCreateTask(!showCreateTask)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                      </button>
                    </div>

                    {/* Create Task Form */}
                    {showCreateTask && (
                      <div className="mb-6 p-6 border-2 border-blue-500 rounded-xl bg-blue-50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-800 text-lg">Create New Task</h3>
                          <button 
                            onClick={() => setShowCreateTask(false)}
                            className="p-1 hover:bg-white rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Task Title"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          />
                          <textarea
                            placeholder="Description"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            rows="3"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              value={newTask.assigned_to}
                              onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                            >
                              <option value="">Select Team Member</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                  {member.user}
                                </option>
                              ))}
                            </select>
                            <div className="relative">
                              <Calendar className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="date"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                value={newTask.due_date}
                                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <select
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              value={newTask.priority}
                              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                            </select>
                            <button
                              onClick={createIndividualTask}
                              className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-sm"
                            >
                              Create Task
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tasks List */}
                    <div className="space-y-4">
                      {individualTasks.map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-800 text-lg pr-4">{task.title}</h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)} flex-shrink-0`}>
                                  {task.priority} priority
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{task.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  {getStatusIcon(task.status)}
                                  <span className="ml-1.5 capitalize">{task.status.replace('_', ' ')}</span>
                                </span>
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1.5" />
                                  Assigned to: {task.assigned_to}
                                </span>
                                {task.due_date && (
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            {taskDocuments[task.id] && taskDocuments[task.id].length > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500 font-medium">Attachments:</span>
                                {taskDocuments[task.id].map(doc => (
                                  <button
                                    key={doc.id}
                                    onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${doc.file}`, '_blank')}
                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer text-xs font-medium transition-colors"
                                  >
                                    <FileText className="w-3 h-3 mr-1.5" />
                                    {doc.name || 'Document'}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No attachments</span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {individualTasks.length === 0 && (
                        <div className="text-center py-12">
                          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks created</h3>
                          <p className="text-gray-600 text-sm max-w-sm mx-auto mb-6">
                            Create individual tasks to assign work to your team members and track progress.
                          </p>
                          <button
                            onClick={() => setShowCreateTask(true)}
                            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Select a Sub-Task</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                    Choose a sub-task from the left panel to view detailed information, manage documents, and create individual tasks for your team members.
                  </p>
                  <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamLeadDashboard;