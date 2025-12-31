import React from 'react';
import { Message } from '../types';
import SongCard from './SongCard';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
}

/**
 * MessageBubble komponenta
 * Prikazuje posamezno sporočilo (user ali bot)
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  /**
   * Formatira čas
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('sl-SI', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`message-wrapper ${
        message.type === 'user' ? 'message-user' : 'message-bot'
      }`}
    >
      <div className={`message-bubble ${message.type}`}>
        <p className="message-content">{message.content}</p>

        {/* Pesmi če obstajajo */}
        {message.songs && message.songs.length > 0 && (
          <div className="songs-list">
            {message.songs.map((song, index) => (
              <SongCard key={index} song={song} />
            ))}
          </div>
        )}

        <p className="message-time">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
};

export default MessageBubble;