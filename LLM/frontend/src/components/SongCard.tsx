import React from 'react';
import { Song } from '../types';
import './SongCard.css';

interface SongCardProps {
  song: Song;
}

/**
 * SongCard komponenta
 * Prikazuje info o pesmi (title, artist, genre, region, reason)
 */
const SongCard: React.FC<SongCardProps> = ({ song }) => {
  return (
    <div className="song-card">
      <div className="song-info">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-artist"> {song.artist}</p>
        
        <div className="song-metadata">
          <span className="song-genre"> {song.genre}</span>
          {song.region && (
            <span className="song-region"> {song.region}</span>
          )}
        </div>
          <br />
        {song.reason && (
          <p className="song-reason"> <b>Reason:</b>  {song.reason}</p>
        )}
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