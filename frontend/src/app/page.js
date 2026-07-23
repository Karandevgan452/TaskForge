'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import TaskStats from '@/components/TaskStats';
import TaskFilterBar from '@/components/TaskFilterBar';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import Toast from '@/components/Toast';
import { fetchTasks, updateTaskStatus, deleteTask } from '@/lib/api';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Task State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Restore user session from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('taskforge_token');
    const storedUser = localStorage.getItem('taskforge_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('taskforge_token');
        localStorage.removeItem('taskforge_user');
      }
    }
  }, []);

  // Fetch tasks callback
  const loadTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchTasks({
        status: statusFilter,
        priority: priorityFilter,
        search,
        page,
        size: 9,
      });
      setTasks(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
        addToast('Session expired. Please sign in again.', 'error');
      } else {
        addToast(err.message || 'Failed to load tasks', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, priorityFilter, search, page]);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token, loadTasks]);

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (data, mode) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('taskforge_token', data.token);
    localStorage.setItem('taskforge_user', JSON.stringify(data.user));
    setAuthModalOpen(false);
    addToast(mode === 'register' ? 'Account created successfully!' : 'Welcome back!');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTasks([]);
    localStorage.removeItem('taskforge_token');
    localStorage.removeItem('taskforge_user');
    addToast('Signed out successfully');
  };

  const handleCycleStatus = async (taskId, nextStatus) => {
    try {
      await updateTaskStatus(taskId, nextStatus);
      addToast(`Task status updated to ${nextStatus.replace('_', ' ')}`);
      loadTasks();
    } catch (err) {
      addToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      addToast('Task deleted successfully');
      loadTasks();
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleTaskModalSuccess = (msg) => {
    setTaskModalOpen(false);
    setSelectedTask(null);
    addToast(msg);
    loadTasks();
  };

  if (!mounted) return null;

  return (
    <div className="app-container">
      <Navbar user={user} onOpenAuth={handleOpenAuth} onLogout={handleLogout} />

      <main className="main-content">
        {!token ? (
          /* Unauthenticated Landing / Hero Section */
          <section className="hero-section">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Next-Gen Task Management Platform</span>
            </div>

            <h1 className="hero-title">
              Streamline project workflows with <span>single-server execution</span>
            </h1>

            <p className="hero-subtitle">
              TaskForge delivers a production-ready, high-performance solution uniting Next.js frontend
              and Spring Boot backend on a single server container. Organize, track, and complete tasks seamlessly.
            </p>

            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={() => handleOpenAuth('register')}>
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => handleOpenAuth('login')}>
                <span>Sign In to Workspace</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginTop: '4rem',
                width: '100%',
                maxWidth: '960px',
                textAlign: 'left',
              }}
            >
              <div className="glass-card">
                <div className="stat-icon-box stat-icon-total" style={{ marginBottom: '1rem' }}>
                  <Zap size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Ultra Fast Next.js SPA
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Built with React Server Components & client routing for smooth, instant interaction without full page reloads.
                </p>
              </div>

              <div className="glass-card">
                <div className="stat-icon-box stat-icon-completed" style={{ marginBottom: '1rem' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  JWT Security Architecture
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Stateless JWT authentication with bcrypt password hashing and validated RESTful endpoint protection.
                </p>
              </div>

              <div className="glass-card">
                <div className="stat-icon-box stat-icon-progress" style={{ marginBottom: '1rem' }}>
                  <Layers size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Single Server Jar
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Frontend static bundle built directly into Spring Boot static resources, served from one single server process.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* Authenticated Dashboard View */
          <div>
            <TaskStats tasks={tasks} />

            <TaskFilterBar
              search={search}
              onSearchChange={(val) => {
                setSearch(val);
                setPage(0);
              }}
              status={statusFilter}
              onStatusChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              priority={priorityFilter}
              onPriorityChange={(val) => {
                setPriorityFilter(val);
                setPage(0);
              }}
              onOpenTaskModal={handleCreateTask}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', fontWeight: 500 }}>Loading workspace tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Inbox size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    No tasks found
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {search || statusFilter || priorityFilter
                      ? 'No tasks match your current filter criteria.'
                      : 'You have no tasks yet. Create your first task to get started!'}
                  </p>
                </div>
                <button className="btn btn-primary" onClick={handleCreateTask}>
                  Create Your First Task
                </button>
              </div>
            ) : (
              <>
                <div className="tasks-grid">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onCycleStatus={handleCycleStatus}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        task={selectedTask}
        onClose={() => setTaskModalOpen(false)}
        onSuccess={handleTaskModalSuccess}
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </div>
  );
}
