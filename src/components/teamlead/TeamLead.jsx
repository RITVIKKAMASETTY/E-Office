import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight, Plus, X, LogOut, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_URL;

const TeamLeadDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('subtasks');
  const [subTasks, setSubTasks] = useState([]);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [individualTasks, setIndividualTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [expandedSubTasks, setExpandedSubTasks] = useState({});

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  });

  useEffect(() => {
    const checkAuth = () => {
      const user = window.localStorage ? localStorage.getItem('userData') : null;
      if (!user) {
        window.location.href = '/login';
        return;
      }
      const parsedUser = JSON.parse(user);
      
      // Check if user is supervisor (team lead)
      if (parsedUser.role !== 'Team Leader') {
        // Redirect to their appropriate dashboard based on role
        const roleRoutes = {
          admin: '/dashboard/admin',
          manager: '/dashboard/manager',
          employee: '/dashboard/employee',
          teamleader: '/dashboard/teamlead'
        };
        const userRole = parsedUser.role === "Team Leader" ? "teamleader" : parsedUser.role.toLowerCase();
        window.location.href = roleRoutes[userRole] || '/dashboard';
        return;
      }
      setUserData(parsedUser);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    if (window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('department');
    }
    window.location.href = '/login';
  };

  const fetchSubTasks = async () => {
    setLoading(true);
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/sub-tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubTasks(data);
      }
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
    }
    setLoading(false);
  };

  const fetchSubTaskDocuments = async (subTaskId) => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/sub-tasks/subtask-documents/${subTaskId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching sub-task documents:', error);
      return [];
    }
  };

  const fetchIndividualTasksBySubTask = async (subTaskId) => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/individual-tasks/subtask/${subTaskId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIndividualTasks(data);
      }
    } catch (error) {
      console.error('Error fetching individual tasks:', error);
    }
  };

  const fetchTaskDocuments = async (taskId) => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/individual-tasks/individual-task-documents/task/${taskId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching task documents:', error);
      return [];
    }
  };

  const uploadSubTaskDocument = async (subTaskId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('sub_task_id', subTaskId);

    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      setUploadProgress({ [file.name]: 0 });
      const response = await fetch(`${API_BASE_URL}/sub-tasks/subtask-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setUploadProgress({ [file.name]: 100 });
        setTimeout(() => setUploadProgress({}), 2000);
        return await response.json();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadProgress({});
    }
  };

  const uploadTaskDocument = async (taskId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('task_id', taskId);

    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      setUploadProgress({ [file.name]: 0 });
      const response = await fetch(`${API_BASE_URL}/individual-tasks/individual-task-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setUploadProgress({ [file.name]: 100 });
        setTimeout(() => setUploadProgress({}), 2000);
        return await response.json();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadProgress({});
    }
  };

  const createIndividualTask = async () => {
    if (!selectedSubTask) return;

    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/individual-tasks/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTask,
          sub_task_id: selectedSubTask.id
        })
      });

      if (response.ok) {
        const createdTask = await response.json();
        setIndividualTasks([...individualTasks, createdTask]);
        setShowCreateTask(false);
        setNewTask({
          title: '',
          description: '',
          assignee: '',
          dueDate: '',
          priority: 'medium',
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchSubTasks();
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
        await uploadSubTaskDocument(id, file);
      } else {
        await uploadTaskDocument(id, file);
      }
    }
    
    if (type === 'subtask') {
      const docs = await fetchSubTaskDocuments(id);
      setDocuments(docs);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

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

      <div className="max-w-7xl mx-auto p-6">
        {!userData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Sub-Tasks
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {subTasks.map(subTask => (
                    <div key={subTask.id} className="border rounded-lg overflow-hidden">
                      <div
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSubTask?.id === subTask.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                        onClick={() => toggleSubTask(subTask)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            {expandedSubTasks[subTask.id] ? (
                              <ChevronDown className="w-4 h-4 mr-2 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2 text-gray-600" />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">{subTask.name || `Sub-Task #${subTask.id}`}</h3>
                              <p className="text-sm text-gray-500">{subTask.description?.substring(0, 50)}...</p>
                            </div>
                          </div>
                          {getStatusIcon(subTask.status)}
                        </div>
                      </div>
                      
                      {expandedSubTasks[subTask.id] && (
                        <div className="bg-gray-50 p-4 border-t">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Document
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'subtask', subTask.id)}
                              accept=".pdf,.doc,.docx,.txt"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {selectedSubTask ? (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Documents</h2>
                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map(doc => (
                          <div key={doc.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                            <FileText className="w-8 h-8 text-blue-600 mr-3" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{doc.name || 'Document'}</p>
                              <p className="text-sm text-gray-500">{doc.uploaded_at}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
                    )}
                    
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mt-4">
                        {Object.entries(uploadProgress).map(([name, progress]) => (
                          <div key={name} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{name}</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
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
                      <h2 className="text-xl font-semibold">Individual Tasks</h2>
                      <button
                        onClick={() => setShowCreateTask(!showCreateTask)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                      </button>
                    </div>

                    {showCreateTask && (
                      <div className="mb-6 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-900">New Individual Task</h3>
                          <button onClick={() => setShowCreateTask(false)}>
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Task Title"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          />
                          <textarea
                            placeholder="Description"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows="3"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Assignee"
                              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              value={newTask.assignee}
                              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                            />
                            <input
                              type="date"
                              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              value={newTask.priority}
                              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                            </select>
                            <select
                              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              value={newTask.status}
                              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <button
                            onClick={createIndividualTask}
                            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Create Task
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {individualTasks.map(task => (
                        <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{task.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                {getStatusIcon(task.status)}
                                <span className="ml-1">{task.status}</span>
                              </span>
                              <span>Assignee: {task.assignee}</span>
                            </div>
                            <label className="flex items-center px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer text-sm">
                              <Upload className="w-3 h-3 mr-1" />
                              Upload
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'task', task.id)}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                      {individualTasks.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No individual tasks created yet</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Sub-Task</h3>
                  <p className="text-gray-600">Choose a sub-task from the left panel to view details and manage tasks</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;