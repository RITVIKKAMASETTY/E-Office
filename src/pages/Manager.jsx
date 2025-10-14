import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Plus, X, LogOut, User, Edit, Trash2, Calendar, Users, ChevronDown, ChevronRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_URL;

const ManagerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [taskDocuments, setTaskDocuments] = useState([]);
  const [subTaskDocuments, setSubTaskDocuments] = useState([]);
  const [individualTasks, setIndividualTasks] = useState([]);
  const [individualTaskDocuments, setIndividualTaskDocuments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateSubTask, setShowCreateSubTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'pending'
  });

  const [newSubTask, setNewSubTask] = useState({
    title: '',
    description: '',
    assigned_team: '',
    due_date: '',
    status: 'pending',
    task_id: null
  });

  useEffect(() => {
    const checkAuth = () => {
      const user = window.localStorage ? localStorage.getItem('userData') : null;
      if (!user) {
        window.location.href = '/login';
        return;
      }
      const parsedUser = JSON.parse(user);
      
      console.log('User role:', parsedUser.role);
      if (parsedUser.role !== 'manager' && parsedUser.role !== 'admin') {
        const roleRoutes = {
          admin: '/dashboard/admin',
          manager: '/dashboard/manager',
          employee: '/dashboard/employee',
          supervisor: '/dashboard/teamlead'
        };
        window.location.href = roleRoutes[parsedUser.role] || '/dashboard';
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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setLoading(false);
  };

  const fetchSubTasks = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/sub-tasks/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubTasks(data);
      }
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
    }
  };

  const fetchIndividualTasks = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/individual-tasks/`, {
        headers: {
          'Authorization': `Token ${token}`
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

  const fetchTaskDocuments = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/tasks/task-documents/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTaskDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching task documents:', error);
    }
  };

  const fetchSubTaskDocuments = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/sub-tasks/subtask-documents/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubTaskDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching subtask documents:', error);
    }
  };

  const fetchIndividualTaskDocuments = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/individual-tasks/individual-task-documents/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIndividualTaskDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching individual task documents:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/teams/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Set some default teams if API fails
      setTeams([{id: 1, name: 'Development Team'}, {id: 2, name: 'QA Team'}]);
    }
  };

  const createTask = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      console.log('Creating task with data:', newTask);
      console.log('API URL:', `${API_BASE_URL}/tasks/`);
      console.log('Token:', token);
      
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newTask)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Created task response:', responseData);
        const createdTask = responseData.task || responseData;
        setTasks(prevTasks => [...prevTasks, createdTask]);
        setShowCreateTask(false);
        setNewTask({
          title: '',
          description: '',
          assigned_to: '',
          due_date: '',
          status: 'pending'
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to create task:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const createSubTask = async () => {
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      const selectedTask = tasks.find(t => t.id === newSubTask.task_id);
      if (!selectedTask) {
        console.error('Please select a parent task');
        return;
      }
      
      const subtaskData = {
        title: newSubTask.title,
        description: newSubTask.description,
        assigned_to: 'codelintpr-cicd',
        assigned_team: newSubTask.assigned_team,
        due_date: newSubTask.due_date,
        status: newSubTask.status,
        task: selectedTask.title
      };
      
      console.log('Creating subtask with data:', subtaskData);
      console.log('API URL:', `${API_BASE_URL}/sub-tasks/`);
      
      const response = await fetch(`${API_BASE_URL}/sub-tasks/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(subtaskData)
      });

      console.log('Subtask response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Created subtask response:', responseData);
        await fetchSubTasks(); // Refresh from server
        setShowCreateSubTask(false);
        setNewSubTask({
          title: '',
          description: '',
          assigned_team: '',
          due_date: '',
          status: 'pending',
          task_id: null
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to create subtask:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const updateTask = async (taskId, updates) => {
    console.log('updateTask called with:', { taskId, updates });
    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      console.log('Update URL:', `${API_BASE_URL}/tasks/${taskId}/`);
      console.log('Update token:', token);
      
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(updates)
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        const updatedTask = await response.json();
        console.log('Update success:', updatedTask);
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
        setEditingTask(null);
      } else {
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const uploadTaskDocument = async (file, taskTitle, description) => {
    console.log('uploadTaskDocument called with:', { file: file.name, taskTitle, description });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task', taskTitle);
    formData.append('description', description);

    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      console.log('Upload URL:', `${API_BASE_URL}/tasks/task-documents/`);
      console.log('Upload token:', token);
      setUploadProgress({ [file.name]: 0 });
      
      const response = await fetch(`${API_BASE_URL}/tasks/task-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload success:', result);
        setUploadProgress({ [file.name]: 100 });
        setTimeout(() => setUploadProgress({}), 2000);
        await fetchTaskDocuments();
        return result;
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        alert(`Upload failed: ${response.status} - Backend configuration issue`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadProgress({});
    }
  };

  const uploadSubTaskDocument = async (file, subTaskTitle, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sub_task', subTaskTitle);
    formData.append('description', description);

    try {
      const token = window.localStorage ? localStorage.getItem('token') : null;
      setUploadProgress({ [file.name]: 0 });
      
      const response = await fetch(`${API_BASE_URL}/sub-tasks/subtask-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setUploadProgress({ [file.name]: 100 });
        setTimeout(() => setUploadProgress({}), 2000);
        await fetchSubTaskDocuments();
        return await response.json();
      }
    } catch (error) {
      console.error('Error uploading subtask document:', error);
      setUploadProgress({});
    }
  };

  useEffect(() => {
    if (userData) {
      fetchTasks();
      fetchSubTasks();
      fetchIndividualTasks();
      fetchTaskDocuments();
      fetchSubTaskDocuments();
      fetchIndividualTaskDocuments();
      fetchTeams();
    }
  }, [userData]);

  const handleFileUpload = async (e, type, title) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    for (const file of files) {
      console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
      try {
        if (type === 'task') {
          const result = await uploadTaskDocument(file, title, `Document for ${title}`);
          console.log('Upload result:', result);
        } else {
          const result = await uploadSubTaskDocument(file, title, `Document for ${title}`);
          console.log('Upload result:', result);
        }
      } catch (error) {
        console.error('Upload failed for file:', file.name, error);
      }
    }
    // Reset file input
    e.target.value = '';
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks({ ...expandedTasks, [taskId]: !expandedTasks[taskId] });
  };

  const getSubTasksForTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];
    return subTasks.filter(subTask => subTask.task === task.title);
  };

  const getDocumentsForSubTask = (subTaskTitle) => {
    return subTaskDocuments.filter(doc => doc.sub_task === subTaskTitle);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#004A9F] rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#1F2937]">Manager Dashboard</h1>
                <p className="text-sm text-gray-600">{userData?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-[#004A9F] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">


        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#1F2937]">Task Management</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004A9F] mx-auto"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => {
                  const taskSubTasks = getSubTasksForTask(task.id);
                  const isExpanded = expandedTasks[task.id];
                  return (
                    <div key={task.id} className="bg-white rounded-lg shadow-sm border">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <button
                                onClick={() => toggleTaskExpansion(task.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              {getStatusIcon(task.status)}
                              <h3 className="text-lg font-semibold text-[#1F2937]">{task.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              {taskSubTasks.length > 0 && (
                                <span className="px-2 py-1 bg-[#FACC15] text-black rounded-full text-xs font-medium">
                                  {taskSubTasks.length} subtasks
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>Assigned to: {task.assigned_to}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due by: {formatDate(task.due_date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setNewSubTask({...newSubTask, task_id: task.id});
                                setShowCreateSubTask(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 bg-[#00A3C4] text-white text-sm rounded hover:bg-[#008BA3] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Subtask</span>
                            </button>

                            <label className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-[#00A3C4] transition-colors cursor-pointer border rounded">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">Add Docs</span>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'task', task.title)}
                              />
                            </label>
                          </div>
                        </div>
                        {uploadProgress[task.title] && (
                          <div className="mt-3">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#00A3C4] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[task.title]}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Task Documents */}
                        {taskDocuments.filter(doc => doc.task === task.title).length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium text-[#1F2937] mb-2">Task Documents</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {taskDocuments.filter(doc => doc.task === task.title).map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <div className="text-sm font-medium">{doc.file}</div>
                                      <div className="text-xs text-gray-500">{doc.description}</div>
                                      <div className="text-xs text-gray-400">Uploaded: {formatDate(doc.uploaded_at)} by {doc.uploaded_by}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {isExpanded && taskSubTasks.length > 0 && (
                        <div className="border-t bg-gray-50 p-4">
                          <h4 className="font-medium text-[#1F2937] mb-3">Subtasks</h4>
                          <div className="space-y-3">
                            {taskSubTasks.map((subTask) => {
                              const subTaskDocs = getDocumentsForSubTask(subTask.title);
                              return (
                                <div key={subTask.id} className="bg-white rounded-lg p-4 border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        {getStatusIcon(subTask.status)}
                                        <h5 className="font-medium text-[#1F2937]">{subTask.title}</h5>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subTask.status)}`}>
                                          {subTask.status.replace('_', ' ')}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{subTask.description}</p>
                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>Due by: {formatDate(subTask.due_date)}</span>
                                        {subTaskDocs.length > 0 && (
                                          <span className="text-[#00A3C4]">{subTaskDocs.length} documents</span>
                                        )}
                                      </div>
                                    </div>
                                    <label className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-[#00A3C4] transition-colors cursor-pointer border rounded text-xs">
                                      <Upload className="w-3 h-3" />
                                      <span>Add Docs</span>
                                      <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'subtask', subTask.title)}
                                      />
                                    </label>
                                  </div>
                                  {subTaskDocs.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                      <div className="grid grid-cols-2 gap-2">
                                        {subTaskDocs.map((doc) => (
                                          <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center space-x-2">
                                              <FileText className="w-4 h-4 text-blue-600" />
                                              <div>
                                                <div className="text-sm font-medium">{doc.file}</div>
                                                <div className="text-xs text-gray-500">{doc.description}</div>
                                                <div className="text-xs text-gray-400">Uploaded: {formatDate(doc.uploaded_at)} by {doc.uploaded_by}</div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Subtask Modal */}
      {showCreateSubTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1F2937]">Create New Subtask</h3>
              <button
                onClick={() => setShowCreateSubTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subtask title"
                value={newSubTask.title}
                onChange={(e) => setNewSubTask({ ...newSubTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              />
              <textarea
                placeholder="Subtask description"
                value={newSubTask.description}
                onChange={(e) => setNewSubTask({ ...newSubTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F] h-24"
              />
              <input
                type="datetime-local"
                value={newSubTask.due_date}
                onChange={(e) => setNewSubTask({ ...newSubTask, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              />
              <select
                value={newSubTask.assigned_team}
                onChange={(e) => setNewSubTask({ ...newSubTask, assigned_team: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              >
                <option value="">Select Team</option>
                <option value="Development Team">Development Team</option>
                <option value="QA Team">QA Team</option>
                <option value="Design Team">Design Team</option>
              </select>
              <select
                value={newSubTask.status}
                onChange={(e) => setNewSubTask({ ...newSubTask, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createSubTask}
                className="flex-1 bg-[#00A3C4] text-white py-2 rounded-lg hover:bg-[#008BA3] transition-colors"
              >
                Create Subtask
              </button>
              <button
                onClick={() => setShowCreateSubTask(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1F2937]">Create New Task</h3>
              <button
                onClick={() => setShowCreateTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              />
              <textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F] h-24"
              />
              <input
                type="text"
                placeholder="Assigned to (e.g. BBMP)"
                value={newTask.assigned_to}
                onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              />
              <input
                type="datetime-local"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createTask}
                className="flex-1 bg-[#004A9F] text-white py-2 rounded-lg hover:bg-[#003875] transition-colors"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowCreateTask(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ManagerDashboard;