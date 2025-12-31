import React from 'react';
import { MusicIcon } from './Icons';
import './ChatHeader.css';

/**
 * ChatHeader komponenta
 * Prikazuje naslov in model info
 */
const ChatHeader: React.FC = () => {
  return (
    <header className="chat-header">
      <div>
        <p className="eyebrow">Welcome back, Sam 👋</p>
        <h1 className="title">Kako ti lahko danes pomagam z glasbo?</h1>
        <p className="subtitle">
          Izberi število pesmi, žanr in opiši razpoloženje ali izvajalca, ki ti
          je všeč.
        </p>
      </div>

      <div className="header-right">
        <div className="model-pill">
          <span className="model-icon">
            <MusicIcon />
          </span>
          <span>Glasbeni asistent • Gemini</span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;