import React from 'react';
import { Song } from '../types';
import './SongCard.css';

interface SongCardProps {
  song: Song;
}

/**
 * SongCard komponenta
 * Prikazuje info o pesmi
 */
const SongCard: React.FC<SongCardProps> = ({ song }) => {
  return (
    <div className="song-card">
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
  );
};

export default SongCard;