import React, { useState } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
}

const StreamingSongs: React.FC = () => {
  const [genre, setGenre] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const handleStream = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!genre.trim()) {
      setError('⚠️ Vnesi žanr');
      return;
    }

    setStreaming(true);
    setCompleted(false);
    setError('');
    setSongs([]);

    try {
      const response = await fetch(`http://localhost:3001/api/songs/stream/${encodeURIComponent(genre)}`);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Streaming ni podprt');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setCompleted(true);
              setStreaming(false);
              break;
            }

            try {
              const song = JSON.parse(data);
              if (song.error) {
                setError(`❌ ${song.error}`);
              } else {
                setSongs(prev => [...prev, song]);
              }
            } catch (err) {
              console.error('Napaka pri parsanju:', err);
            }
          }
        }
      }
    } catch (err) {
      setError('❌ Napaka pri streaming-u');
      console.error(err);
      setStreaming(false);
    }
  };

  return (
    <div className="component-container">
      <h2>🎶 Streaming pesmi po žanru</h2>
      <p className="info">Server-side streaming RPC - pesmi prihajajo ena za drugo v realnem času</p>
      
      <form onSubmit={handleStream} className="search-form">
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Vnesi žanr (npr. Rock)"
          className="search-input"
          disabled={streaming}
        />
        <button type="submit" disabled={streaming} className="btn-primary">
          {streaming ? '⏳ Streaming...' : '▶️ Začni streaming'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {streaming && (
        <div className="streaming-indicator">
          <p>🔴 Streaming v teku... Čakam na pesmi</p>
        </div>
      )}

      {songs.length > 0 && (
        <div className="streaming-results">
          <h3>Prejete pesmi ({songs.length}):</h3>
          <div className="song-stream">
            {songs.map((song, index) => (
              <div key={`${song.id}-${index}`} className="song-card stream-item">
                <span className="stream-order">#{index + 1}</span>
                <h4>{song.title}</h4>
                <p className="artist">👤 {song.artist}</p>
                <p className="genre">🎸 {song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed && (
        <div className="completed-message">
          ✅ Streaming zaključen! Prejetih {songs.length} pesmi.
        </div>
      )}

      {completed && songs.length === 0 && !error && (
        <p className="info">Ni pesmi za žanr "{genre}"</p>
      )}
    </div>
  );
};

export default StreamingSongs;