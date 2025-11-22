import React, { useState } from 'react';
import axios from 'axios';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
}

const SingleSong: React.FC = () => {
  const [songId, setSongId] = useState('');
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!songId.trim()) {
      setError('⚠️ Vnesi ID pesmi');
      return;
    }

    setLoading(true);
    setError('');
    setSong(null);

    try {
      const response = await axios.get(`http://localhost:3001/api/songs/${songId}`);
      setSong(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('❌ Pesem z tem ID-jem ni najdena');
      } else {
        setError('❌ Napaka pri iskanju pesmi');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2>🔍 Išči pesem po ID-ju</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
          placeholder="Vnesi ID pesmi (npr. 1)"
          className="search-input"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Iščem...' : 'Išči'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {song && (
        <div className="song-detail">
          <h3>🎵 {song.title}</h3>
          <div className="detail-row">
            <span className="label">Izvajalec:</span>
            <span>{song.artist}</span>
          </div>
          <div className="detail-row">
            <span className="label">Žanr:</span>
            <span>{song.genre}</span>
          </div>
          <div className="detail-row">
            <span className="label">ID:</span>
            <span>{song.id}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSong;