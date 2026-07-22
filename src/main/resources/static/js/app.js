/* TaskForge — Single Server Vanilla JavaScript Application Logic */

const API_BASE = '/api';

let currentUser = null;
let jwtToken = localStorage.getItem('taskforge_token') || null;
let storedUser = localStorage.getItem('taskforge_user');
if (storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch (e) {
        currentUser = null;
    }
}

let currentPage = 0;
let totalPages = 1;
let authMode = 'login'; // 'login' or 'register'
let searchTimeout = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    updateNavUI();
    if (jwtToken && currentUser) {
        showDashboard();
        loadTasks();
    } else {
        showHero();
    }
});

// Update Navbar UI State
function updateNavUI() {
    const navActions = document.getElementById('navActions');
    if (jwtToken && currentUser) {
        navActions.innerHTML = `
            <div class="user-profile-badge">
                <div class="user-info-text">
                    <span class="user-name">${escapeHtml(currentUser.name)}</span>
                    <span class="user-email">${escapeHtml(currentUser.email)}</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Sign Out</button>
            </div>
        `;
    } else {
        navActions.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="openAuthModal('login')">Sign In</button>
            <button class="btn btn-primary btn-sm" onclick="openAuthModal('register')">Register</button>
        `;
    }
}

// Show/Hide Sections
function showHero() {
    document.getElementById('authHero').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('authHero').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
}

// Auth Modal Management
function openAuthModal(mode) {
    authMode = mode;
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authModalTitle');
    const subtitle = document.getElementById('authModalSubtitle');
    const nameGroup = document.getElementById('nameGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');

    if (mode === 'register') {
        title.textContent = 'Create TaskForge Account';
        subtitle.textContent = 'Join TaskForge to manage your projects seamlessly.';
        nameGroup.classList.remove('hidden');
        submitBtn.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleLink.textContent = 'Sign In here';
    } else {
        title.textContent = 'Sign In to TaskForge';
        subtitle.textContent = 'Enter your credentials to manage your task workspace.';
        nameGroup.classList.add('hidden');
        submitBtn.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = 'Register here';
    }

    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    document.getElementById('authName').value = '';
    modal.classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function toggleAuthMode(event) {
    event.preventDefault();
    openAuthModal(authMode === 'login' ? 'register' : 'login');
}

// Handle Login / Register Submit
async function handleAuthSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName').value.trim();

    const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
    const payload = authMode === 'register' ? { name, email, password } : { email, password };

    try {
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || 'Authentication failed', 'error');
            return;
        }

        jwtToken = data.token;
        currentUser = data.user;

        localStorage.setItem('taskforge_token', jwtToken);
        localStorage.setItem('taskforge_user', JSON.stringify(currentUser));

        closeAuthModal();
        updateNavUI();
        showDashboard();
        loadTasks();

        showToast(authMode === 'register' ? 'Account created successfully!' : 'Welcome back!');
    } catch (err) {
        showToast('Network error during authentication', 'error');
    }
}

// Logout
function handleLogout() {
    jwtToken = null;
    currentUser = null;
    localStorage.removeItem('taskforge_token');
    localStorage.removeItem('taskforge_user');

    updateNavUI();
    showHero();
    showToast('Signed out successfully');
}

// Load Tasks from Backend API
async function loadTasks() {
    if (!jwtToken) return;

    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    const search = document.getElementById('searchInput').value.trim();

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);
    params.append('page', currentPage);
    params.append('size', 10);
    params.append('sortBy', 'createdAt');
    params.append('sortDir', 'desc');

    try {
        const response = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const data = await response.json();
        renderTasks(data.content);
        updatePagination(data);
        updateMetrics(data.content);
    } catch (err) {
        showToast('Failed to load tasks', 'error');
    }
}

// Handle Real-time Search Input
function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 0;
        loadTasks();
    }, 300);
}

// Render Task Cards Grid
function renderTasks(tasks) {
    const grid = document.getElementById('tasksGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        emptyState.classList.remove('hidden');
        grid.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const statusClass = `badge-${task.status.toLowerCase().replace('_', '-')}`;
        const priorityClass = `badge-${task.priority.toLowerCase()}`;
        const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

        card.innerHTML = `
            <div class="task-header">
                <span class="task-title">${escapeHtml(task.title)}</span>
                <div class="task-badges">
                    <span class="badge ${priorityClass}">${task.priority}</span>
                    <span class="badge ${statusClass}">${task.status.replace('_', ' ')}</span>
                </div>
            </div>

            <div class="task-desc">${escapeHtml(task.description || 'No description provided.')}</div>

            ${formattedDate ? `<div class="task-meta">📅 Due: ${formattedDate}</div>` : ''}

            <div class="task-footer">
                <button class="btn btn-secondary btn-sm" onclick="cycleStatus('${task.id}', '${task.status}')">
                    ${getStatusNextActionText(task.status)}
                </button>
                <div class="task-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editTask('${task.id}', '${escapeHtml(task.title)}', '${escapeHtml(task.description || '')}', '${task.priority}', '${task.dueDate || ''}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function getStatusNextActionText(currentStatus) {
    if (currentStatus === 'PENDING') return '⚡ Start Progress';
    if (currentStatus === 'IN_PROGRESS') return '✅ Mark Complete';
    return '🔄 Reopen Task';
}

function getNextStatus(currentStatus) {
    if (currentStatus === 'PENDING') return 'IN_PROGRESS';
    if (currentStatus === 'IN_PROGRESS') return 'COMPLETED';
    return 'PENDING';
}

// Cycle Task Status via PATCH endpoint
async function cycleStatus(taskId, currentStatus) {
    const nextStatus = getNextStatus(currentStatus);
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ status: nextStatus })
        });

        if (!response.ok) {
            showToast('Failed to update status', 'error');
            return;
        }

        showToast(`Task status updated to ${nextStatus.replace('_', ' ')}`);
        loadTasks();
    } catch (err) {
        showToast('Network error updating status', 'error');
    }
}

// Update Pagination Bar
function updatePagination(data) {
    const bar = document.getElementById('paginationBar');
    if (data.totalPages <= 1) {
        bar.classList.add('hidden');
        return;
    }

    bar.classList.remove('hidden');
    totalPages = data.totalPages;
    currentPage = data.pageNumber;

    document.getElementById('pageInfo').textContent = `Page ${currentPage + 1} of ${totalPages}`;
    document.getElementById('prevPageBtn').disabled = data.first;
    document.getElementById('nextPageBtn').disabled = data.last;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 0 && newPage < totalPages) {
        currentPage = newPage;
        loadTasks();
    }
}

// Metrics Calculation
function updateMetrics(tasks) {
    let total = tasks ? tasks.length : 0;
    let pending = 0, inProgress = 0, completed = 0;

    if (tasks) {
        tasks.forEach(t => {
            if (t.status === 'PENDING') pending++;
            else if (t.status === 'IN_PROGRESS') inProgress++;
            else if (t.status === 'COMPLETED') completed++;
        });
    }

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statInProgress').textContent = inProgress;
    document.getElementById('statCompleted').textContent = completed;
}

// Task Modal (Create / Edit)
function openTaskModal() {
    document.getElementById('taskId').value = '';
    document.getElementById('taskModalTitle').textContent = 'Create New Task';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'MEDIUM';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskSubmitBtn').textContent = 'Create Task';
    document.getElementById('taskModal').classList.remove('hidden');
}

function editTask(id, title, description, priority, dueDate) {
    document.getElementById('taskId').value = id;
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('taskTitle').value = unescapeHtml(title);
    document.getElementById('taskDescription').value = unescapeHtml(description);
    document.getElementById('taskPriority').value = priority;

    if (dueDate) {
        const d = new Date(dueDate);
        const isoLocal = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        document.getElementById('taskDueDate').value = isoLocal;
    } else {
        document.getElementById('taskDueDate').value = '';
    }

    document.getElementById('taskSubmitBtn').textContent = 'Update Task';
    document.getElementById('taskModal').classList.remove('hidden');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
}

// Handle Create / Edit Task Submit
async function handleTaskSubmit(event) {
    event.preventDefault();
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const dueDateVal = document.getElementById('taskDueDate').value;

    const dueDate = dueDateVal ? new Date(dueDateVal).toISOString() : null;

    const isEdit = Boolean(taskId);
    const url = isEdit ? `${API_BASE}/tasks/${taskId}` : `${API_BASE}/tasks`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = { title, description, priority, dueDate };
    if (isEdit) {
        payload.status = 'PENDING';
    }

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const data = await response.json();
            showToast(data.message || 'Failed to save task', 'error');
            return;
        }

        closeTaskModal();
        showToast(isEdit ? 'Task updated successfully!' : 'Task created successfully!');
        loadTasks();
    } catch (err) {
        showToast('Network error saving task', 'error');
    }
}

// Delete Task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!response.ok) {
            showToast('Failed to delete task', 'error');
            return;
        }

        showToast('Task deleted successfully');
        loadTasks();
    } catch (err) {
        showToast('Network error deleting task', 'error');
    }
}

// Helper: Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '⚠️'}</span>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Utility: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function unescapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}
