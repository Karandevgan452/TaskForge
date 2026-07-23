'use client';

import { Calendar, Edit3, Trash2, ArrowRightCircle, CheckCircle2, RotateCcw, Play } from 'lucide-react';

export default function TaskCard({ task, onCycleStatus, onEdit, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="pill-badge badge-pending">Pending</span>;
      case 'IN_PROGRESS':
        return <span className="pill-badge badge-in-progress">In Progress</span>;
      case 'COMPLETED':
        return <span className="pill-badge badge-completed">Completed</span>;
      default:
        return <span className="pill-badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'LOW':
        return <span className="pill-badge badge-low">Low</span>;
      case 'MEDIUM':
        return <span className="pill-badge badge-medium">Medium</span>;
      case 'HIGH':
        return <span className="pill-badge badge-high">High</span>;
      default:
        return <span className="pill-badge">{priority}</span>;
    }
  };

  const getNextStatusAction = (currentStatus) => {
    if (currentStatus === 'PENDING') {
      return { text: 'Start Progress', icon: <Play size={14} />, next: 'IN_PROGRESS' };
    }
    if (currentStatus === 'IN_PROGRESS') {
      return { text: 'Mark Complete', icon: <CheckCircle2 size={14} />, next: 'COMPLETED' };
    }
    return { text: 'Reopen Task', icon: <RotateCcw size={14} />, next: 'PENDING' };
  };

  const nextAction = getNextStatusAction(task.status);
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="task-card">
      <div className="task-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <h3 className="task-title">{task.title}</h3>
          <div className="task-badges">
            {getPriorityBadge(task.priority)}
            {getStatusBadge(task.status)}
          </div>
        </div>
      </div>

      <p className="task-desc">{task.description || 'No description provided.'}</p>

      {formattedDueDate && (
        <div className="task-due">
          <Calendar size={14} />
          <span>Due: {formattedDueDate}</span>
        </div>
      )}

      <div className="task-footer">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onCycleStatus(task.id, nextAction.next)}
        >
          {nextAction.icon}
          <span>{nextAction.text}</span>
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)} title="Edit Task">
            <Edit3 size={14} />
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)} title="Delete Task">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
