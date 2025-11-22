import React, { useState } from 'react';
import axios from 'axios';

interface AddSongProps {
  onSongAdded: () => void;
}

const AddSong: React.FC<AddSongProps> = ({ onSongAdded }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/songs', {
        title,
        artist,
        genre
      });

      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setTitle('');
        setArtist('');
        setGenre('');
        setTimeout(() => {
          onSongAdded();
        }, 1000);
      }
    } catch (error) {
      setMessage('❌ Napaka pri dodajanju pesmi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2>➕ Dodaj novo pesem</h2>
      <form onSubmit={handleSubmit} className="song-form">
        <div className="form-group">
          <label>Naslov pesmi:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="npr. Bohemian Rhapsody"
            required
          />
        </div>

        <div className="form-group">
          <label>Izvajalec:</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="npr. Queen"
            required
          />
        </div>

        <div className="form-group">
          <label>Žanr:</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="npr. Rock"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Dodajam...' : 'Dodaj pesem'}
        </button>

        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
};

export default AddSong;