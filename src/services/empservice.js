// empservice.js
// API service for employee task and document management with Pinata integration

const API_BASE_URL = import.meta.env.VITE_URL;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token') || '';
};

// Create headers with authentication
const getHeaders = (includeContentType = true) => {
  const headers = {
    Authorization: `Token ${getToken()}`,
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || 'API request failed');
  }
  return response.json().catch(() => ({}));
};

const empService = {
  // ============ PINATA FILE UPLOAD ============

  /**
   * Upload file to Pinata IPFS
   * @param {File} file - File object to upload
   * @returns {Promise<string>} - IPFS hash/URL
   */
  uploadToPinata: async (file) => {
    try {
      if (!PINATA_API_KEY || !PINATA_API_SECRET) {
        throw new Error('Pinata credentials not configured. Please set REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_API_SECRET');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Optional: Add metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          originalFileName: file.name,
        },
      });
      formData.append('pinataMetadata', metadata);

      // Optional: Add pinata options
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const response = await fetch(PINATA_API_URL, {
        method: 'POST',
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload to Pinata');
      }

      const data = await response.json();
      
      // Return the IPFS gateway URL
      const ipfsHash = data.IpfsHash;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      return gatewayUrl;
    } catch (error) {
      throw new Error(`Pinata upload failed: ${error.message}`);
    }
  },

  /**
   * Upload to Pinata and save reference in backend
   * @param {File} file - File to upload
   * @param {number} taskId - Task ID
   * @param {string} description - Document description
   */
  uploadDocumentViaPinata: async (file, taskTitle, description) => {
    try {
      // Step 1: Upload file to Pinata
      console.log('Starting Pinata upload...');
      const pinataUrl = await empService.uploadToPinata(file);
      console.log('Pinata upload successful:', pinataUrl);

      // Validate description
      if (!description || description.trim() === '') {
        throw new Error('Description is required and cannot be empty');
      }

      // Step 2: Send Pinata URL to backend
      // Note: The serializer expects 'task' as slug (title), not ID
      const documentData = {
        task: taskTitle, // Use task title/slug, not ID
        file: pinataUrl,
        description: description.trim(),
      };

      console.log('Sending document data to backend:', documentData);
      console.log('Task Title being sent:', taskTitle);
      console.log('Description being sent:', description);

      const response = await fetch(
        `${API_BASE_URL}/individual-tasks/individual-task-documents/`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(documentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error response:', errorData);
        console.error('Full response status:', response.status);
        console.error('Full response headers:', {
          contentType: response.headers.get('content-type'),
        });
        
        // Format error message
        let errorMsg = 'Backend validation failed';
        if (errorData.task) {
          errorMsg = Array.isArray(errorData.task) ? errorData.task[0] : errorData.task;
        } else if (errorData.description) {
          errorMsg = Array.isArray(errorData.description) ? errorData.description[0] : errorData.description;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        }
        
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('Document saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  },


  // ============ INDIVIDUAL TASKS ============

  /**
   * Get all individual tasks for the current employee
   */
  getIndividualTasks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
  },

  /**
   * Get a specific individual task by ID
   */
  getIndividualTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/${taskId}/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to fetch task: ${error.message}`);
    }
  },

  /**
   * Get all tasks for a specific sub-task
   */
  getTasksBySubtask: async (subTaskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/subtask/${subTaskId}/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      throw new Error(`Failed to fetch subtask tasks: ${error.message}`);
    }
  },

  /**
   * Create a new individual task
   */
  createTask: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  },

  /**
   * Update an individual task
   */
  updateTask: async (taskId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/${taskId}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  },

  /**
   * Partially update an individual task
   */
  patchTask: async (taskId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/${taskId}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  },

  /**
   * Delete an individual task
   */
  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/${taskId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  },

  // ============ INDIVIDUAL TASK DOCUMENTS ============

  /**
   * Get all documents
   */
  getAllDocuments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/individual-tasks/individual-task-documents/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  },

  /**
   * Get documents for a specific task
   */
  getDocumentsByTask: async (taskId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/individual-tasks/individual-task-documents/task/${taskId}/`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      throw new Error(`Failed to fetch task documents: ${error.message}`);
    }
  },

  /**
   * Get a specific document by ID
   */
  getDocument: async (docId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/individual-tasks/individual-task-documents/${docId}/`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  },

  /**
   * Upload a new document for a task (using Pinata)
   * Expects FormData with: taskTitle, file, description
   */
  uploadDocument: async (formData) => {
    try {
      const file = formData.get('file');
      const taskTitle = formData.get('taskTitle');
      const description = formData.get('description');

      console.log('uploadDocument called with FormData:');
      console.log('  taskTitle:', taskTitle);
      console.log('  description:', description);
      console.log('  fileName:', file?.name);
      console.log('  All FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? v.name : v]));

      if (!file) {
        throw new Error('File is required');
      }

      if (!taskTitle || String(taskTitle).trim() === '') {
        throw new Error('Task title is required');
      }

      if (!description || String(description).trim() === '') {
        throw new Error('Description is required');
      }

      return await empService.uploadDocumentViaPinata(file, taskTitle, description);
    } catch (error) {
      console.error('uploadDocument error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  },

  /**
   * Update a document
   */
  updateDocument: async (docId, updates) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/individual-tasks/individual-task-documents/${docId}/`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updates),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  },

  /**
   * Partially update a document
   */
  patchDocument: async (docId, updates) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/individual-tasks/individual-task-documents/${docId}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(updates),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  },

  /**
   * Delete a document
   */
  deleteDocument: async (docId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/individual-tasks/individual-task-documents/${docId}/`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },

  // ============ UTILITY METHODS ============

  /**
   * Set authentication token
   */
  setToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    }
  },

  /**
   * Clear authentication token
   */
  clearToken: () => {
    localStorage.removeItem('authToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!getToken();
  },

  /**
   * Download a document from Pinata URL
   */
  downloadDocument: async (fileUrl) => {
    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileUrl.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  },
};

export default empService;