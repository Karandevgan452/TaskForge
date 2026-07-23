'use client';

import { CheckSquare, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout }) {
  return (
    <header className="navbar">
      <div className="brand-logo">
        <div className="brand-icon">
          <CheckSquare size={22} />
        </div>
        <span>TaskForge</span>
      </div>

      <div className="nav-actions">
        {user ? (
          <div className="user-badge">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuth('login')}>
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>
              <UserPlus size={16} />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
