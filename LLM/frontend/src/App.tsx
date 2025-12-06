import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Song {
  title: string;
  artist: string;
  genre: string;
  link: string;
}

interface SongsResponse {
  songs: Song[];
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  songs?: Song[];
  timestamp: Date;
}

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
    <path d="M4 12a8 8 0 018-8" strokeLinecap="round" />
  </svg>
);

export default function MusicChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content:
        'Živjo! 🎵 Sem tvoj glasbeni asistent. Izberi število pesmi, žanr in napiši svoje želje (npr. izvojalec, vibe, obdobje)...',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [songCount, setSongCount] = useState<number>(5);       // NOVO
  const [genre, setGenre] = useState<string>('pop');           // NOVO
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // varnostno omejimo 1–10
    const normalizedCount = Math.min(10, Math.max(1, songCount || 1));

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `(${normalizedCount} pesmi, žanr: ${genre}) ${inputValue}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSongCount(normalizedCount);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // tu lahko backend lepo prebere strukturirano:
        body: JSON.stringify({
          message: inputValue,       // originalni tekst
          count: normalizedCount,    // število pesmi
          genre: genre,              // žanr
        }),
      });

      if (!response.ok) {
        throw new Error('Napaka pri pridobivanju podatkov');
      }

      const data: SongsResponse = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Super! Našel sem ${data.songs.length} ${
          data.songs.length === 1
            ? 'pesem'
            : data.songs.length === 2
            ? 'pesmi'
            : data.songs.length === 3 || data.songs.length === 4
            ? 'pesmi'
            : 'pesmi'
        } (${genre}):`,
        songs: data.songs,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content:
          'Oprostite, prišlo je do napake. Prosim, poskusite znova. Prepričajte se, da je backend strežnik zagnan.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = ['Za trening', 'Za chill', 'Za žur', 'Nekaj podobnega kot Weeknd'];

  return (
    <div className="app-root">
      <div className="app-container">
        {/* SIDEBAR skrajšan, enak kot prej */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="avatar-circle">S</div>
            <div>
              <p className="sidebar-name">Sam Smith</p>
              <p className="sidebar-role">Music workspace</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item active">Home</button>
            <button className="nav-item">Moje pesmi</button>
            <button className="nav-item">Zgodovina</button>
          </nav>
          <div className="sidebar-footer">
            <div className="limit-card">
              <p className="limit-title">AI priporočila</p>
              <p className="limit-subtitle">Neomejeno v testnem načinu</p>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="chat-header">
            <div>
              <p className="eyebrow">Welcome back, Sam 👋</p>
              <h1 className="title">Kako ti lahko danes pomagam z glasbo?</h1>
              <p className="subtitle">
                Izberi število pesmi, žanr in opiši razpoloženje ali izvajalca, ki ti je všeč.
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

          <section className="content-card">
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    message.type === 'user' ? 'message-user' : 'message-bot'
                  }`}
                >
                  <div className={`message-bubble ${message.type}`}>
                    <p className="message-content">{message.content}</p>

                    {message.songs && message.songs.length > 0 && (
                      <div className="songs-list">
                        {message.songs.map((song, index) => (
                          <div key={index} className="song-card">
                            <div className="song-info">
                              <h3>{song.title}</h3>
                              <p className="song-artist">{song.artist}</p>
                              <span className="song-genre">{song.genre}</span>
                            </div>
                            <a
                              href={song.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="song-link"
                            >
                              Poslušaj
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="message-time">
                      {message.timestamp.toLocaleTimeString('sl-SI', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

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

            {/* hitri predlogi – zdaj samo opisno, brez številk/žanra */}
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

            {/* INPUT + kontrole */}
            <div className="input-container">
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
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="send-button"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
