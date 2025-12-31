import React, { useState } from 'react';
import { SendIcon } from './Icons';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string, count: number, genre: string) => void;
  isLoading: boolean;
}

/**
 * ChatInput komponenta
 * Input area z kontrolami za število pesmi in žanr
 */
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [songCount, setSongCount] = useState<number>(5);
  const [genre, setGenre] = useState<string>('pop');

  // Quick prompts
  const quickPrompts = [
    'Za trening',
    'Za chill',
    'Za žur',
    'Nekaj podobnega kot Weeknd',
  ];

  /**
   * Pošlji sporočilo
   */
  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;

    const normalizedCount = Math.min(10, Math.max(1, songCount));
    onSendMessage(inputValue, normalizedCount, genre);

    // Počisti input
    setInputValue('');
  };

  /**
   * Enter key handler
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-section">
      {/* Quick prompts */}
      <div className="quick-prompts">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => setInputValue(prompt)}
            className="quick-prompt-btn"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="input-container">
        {/* Kontrole - število in žanr */}
        <div className="input-top-row">
          <div className="field-group">
            <label className="field-label">Število pesmi</label>
            <input
              type="number"
              min={1}
              max={10}
              value={songCount}
              onChange={(e) => setSongCount(Number(e.target.value))}
              className="field-input number-input"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Žanr</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="field-input select-input"
            >
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="r&b">R&B</option>
              <option value="hip hop">Hip hop</option>
              <option value="balkan">Balkan</option>
              <option value="electronic">Electronic</option>
            </select>
          </div>
        </div>

        {/* Input in Send gumb */}
        <div className="input-bottom-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napiši želje (npr. 'nekaj počasnega kot stari Weeknd')..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;