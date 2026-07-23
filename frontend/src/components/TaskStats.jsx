'use client';

import { Layers, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function TaskStats({ tasks = [] }) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="stats-grid">
      <div className="glass-card stat-card">
        <div className="stat-icon-box stat-icon-total">
          <Layers size={24} />
        </div>
        <div>
          <div className="stat-val">{total}</div>
          <div className="stat-lbl">Total Tasks</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-box stat-icon-pending">
          <Clock size={24} />
        </div>
        <div>
          <div className="stat-val">{pending}</div>
          <div className="stat-lbl">Pending</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-box stat-icon-progress">
          <PlayCircle size={24} />
        </div>
        <div>
          <div className="stat-val">{inProgress}</div>
          <div className="stat-lbl">In Progress</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-box stat-icon-completed">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="stat-val">{completed}</div>
          <div className="stat-lbl">Completed</div>
        </div>
      </div>
    </div>
  );
}
