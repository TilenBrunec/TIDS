import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { LoaderIcon } from './Icons';
import './ChatContent.css';

interface ChatContentProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string, count: number, genre: string) => void;
}

/**
 * ChatContent komponenta
 * Glavni del aplikacije z chatomom
 */
const ChatContent: React.FC<ChatContentProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto scroll na novo sporočilo
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="main">
      <ChatHeader />

      <section className="content-card">
        {/* Messages area */}
        <div className="messages-container">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="message-wrapper message-bot">
              <div className="message-bubble bot loading-message">
                <LoaderIcon />
                <span>Iščem pesmi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </section>
    </main>
  );
};

export default ChatContent;