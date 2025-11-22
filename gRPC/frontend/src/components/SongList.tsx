import React, { useState, useEffect } from "react";
import axios from "axios";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
}

interface SongListProps {
  refreshTrigger: number;
}

const SongList: React.FC<SongListProps> = ({ refreshTrigger }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSongs();
  }, [refreshTrigger]);

  const fetchSongs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:3001/api/songs");
      setSongs(response.data.songs);
    } catch (err) {
      setError("❌ Napaka pri pridobivanju pesmi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="component-container">
        <h2>📋 Vse pesmi</h2>
        <p>Nalagam pesmi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <h2>📋 Vse pesmi</h2>
        <p className="error">{error}</p>
        <button onClick={fetchSongs} className="btn-secondary">
          Poskusi znova
        </button>
      </div>
    );
  }

  return (
    <div className="component-container">
      <h2>📋 Vse pesmi ({songs.length})</h2>
      <button onClick={fetchSongs} className="btn-secondary refresh-btn">
        🔄 Osveži
      </button>

      {songs.length === 0 ? (
        <p>Ni najdenih pesmi. Dodaj prvo pesem!</p>
      ) : (
        <div className="song-grid">
          {songs.map((song) => (
            <div key={song.id} className="song-card">
              <h3>{song.title}</h3>
              <p className="artist">👤 {song.artist}</p>
              <p className="genre">🎸 {song.genre}</p>
              <p className="id">ID: {song.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongList;
