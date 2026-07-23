'use client';

import { Search, Plus, Filter } from 'lucide-react';

export default function TaskFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  onOpenTaskModal,
}) {
  return (
    <div className="controls-bar">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter:</span>
        </div>

        <select
          className="select-input"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          className="select-input"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
        </select>

        <button className="btn btn-primary" onClick={onOpenTaskModal}>
          <Plus size={18} />
          <span>Create Task</span>
        </button>
      </div>
    </div>
  );
}
