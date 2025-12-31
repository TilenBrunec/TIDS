import React from 'react';
import { SessionPreview } from '../types';
import { TrashIcon, PlusIcon } from './Icons';
import './Sidebar.css';

interface SidebarProps {
  sessions: SessionPreview[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

/**
 * Sidebar komponenta
 * Prikazuje zgodovino pogovorov in omogoča navigacijo
 */
const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  /**
   * Formatira datum v berljivo obliko
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `pred ${diffMins} min`;
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `pred ${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `pred ${diffDays} dni`;
    }

    return date.toLocaleDateString('sl-SI');
  };

  /**
   * Skrajša preview tekst
   */
  const truncatePreview = (text: string, maxLength: number = 40): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="avatar-circle">S</div>
        <div>
          <p className="sidebar-name">Sam Smith</p>
          <p className="sidebar-role">Music workspace</p>
        </div>
      </div>

      {/* Nov pogovor gumb */}
      <button className="new-chat-btn" onClick={onNewSession}>
        <PlusIcon />
        <span>Nov pogovor</span>
      </button>

      {/* Navigacija - Zgodovina */}
      <nav className="sidebar-nav">
        <h3 className="nav-title">Zgodovina</h3>

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <p className="empty-state">Ni zgodovine</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`session-item ${
                  session.sessionId === currentSessionId ? 'active' : ''
                }`}
                onClick={() => onSelectSession(session.sessionId)}
              >
                <div className="session-info">
                  <p className="session-preview">
                    {truncatePreview(session.preview)}
                  </p>
                  <p className="session-time">
                    {formatDate(session.lastActivity)} • {session.messageCount}{' '}
                    sporočil
                  </p>
                </div>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.sessionId);
                  }}
                  title="Izbriši pogovor"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="limit-card">
          <p className="limit-title">AI priporočila</p>
          <p className="limit-subtitle">Neomejeno v testnem načinu</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;