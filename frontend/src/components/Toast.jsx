'use client';

import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '0.1rem',
          marginLeft: '0.5rem',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
