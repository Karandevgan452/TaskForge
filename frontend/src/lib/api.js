const API_BASE = '/api';

/**
 * Helper to get authorization headers
 */
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('taskforge_token') : null;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle API responses and extract JSON or throw structured error
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (data) {
      if (data.message) {
        errorMsg = data.message;
      } else if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        errorMsg = data.details.join(', ');
      } else if (data.error) {
        errorMsg = data.error;
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  return handleResponse(response);
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
  });
  return handleResponse(response);
}

export async function fetchTasks({ status = '', priority = '', search = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (search) params.append('search', search.trim());
  params.append('page', page);
  params.append('size', size);
  params.append('sortBy', 'createdAt');
  params.append('sortDir', 'desc');

  const response = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createTask({ title, description, priority, dueDate }) {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
    }),
  });
  return handleResponse(response);
}

export async function updateTask(id, { title, description, priority, dueDate, status }) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'MEDIUM',
      status: status || 'PENDING',
      dueDate: dueDate || null,
    }),
  });
  return handleResponse(response);
}

export async function updateTaskStatus(id, status) {
  const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 204 || response.status === 200) {
    return true;
  }
  return handleResponse(response);
}
