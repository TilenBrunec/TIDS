// music-server.js
const fs = require('fs');
const path = require('path');

// Simulirana baza glasbenih podatkov
const musicDatabase = {
  songs: [
    { id: 1, title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", year: 1975, genre: "Rock", duration: 354 },
    { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV", year: 1971, genre: "Rock", duration: 482 },
    { id: 3, title: "Imagine", artist: "John Lennon", album: "Imagine", year: 1971, genre: "Pop", duration: 183 },
    { id: 4, title: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind", year: 1991, genre: "Grunge", duration: 301 },
    { id: 5, title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", year: 1983, genre: "Pop", duration: 294 }
  ],
  playlists: [
    { id: 1, name: "Rock Classics", songIds: [1, 2, 4] },
    { id: 2, name: "80s Hits", songIds: [5] }
  ],
  stats: {
    totalPlays: 15420,
    activeUsers: 342,
    topGenre: "Rock"
  }
};

const PIPE_NAME = process.platform === 'win32' 
  ? '\\\\.\\pipe\\music-pipe' 
  : '/tmp/music-pipe';

console.log('🎵 Music Server starting...');
console.log(`📍 Pipe location: ${PIPE_NAME}`);

// Odstrani obstoječo cev, če obstaja
if (process.platform !== 'win32' && fs.existsSync(PIPE_NAME)) {
  fs.unlinkSync(PIPE_NAME);
}

// Funkcije za obdelavo zahtevkov
function handleRequest(request) {
  try {
    const req = JSON.parse(request);
    console.log(`📨 Received request: ${req.action}`);

    switch (req.action) {
      case 'GET_SONG':
        return getSong(req.songId);
      
      case 'SEARCH_SONGS':
        return searchSongs(req.query);
      
      case 'GET_PLAYLIST':
        return getPlaylist(req.playlistId);
      
      case 'GET_STATS':
        return getStats();
      
      case 'ADD_TO_PLAYLIST':
        return addToPlaylist(req.playlistId, req.songId);
      
      case 'GET_RECOMMENDATIONS':
        return getRecommendations(req.genre);
      
      default:
        return { error: 'Unknown action', action: req.action };
    }
  } catch (error) {
    return { error: 'Invalid request format', details: error.message };
  }
}

function getSong(songId) {
  const song = musicDatabase.songs.find(s => s.id === songId);
  if (song) {
    return { success: true, song };
  }
  return { error: 'Song not found', songId };
}

function searchSongs(query) {
  const results = musicDatabase.songs.filter(song => 
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase()) ||
    song.album.toLowerCase().includes(query.toLowerCase())
  );
  return { success: true, results, count: results.length };
}

function getPlaylist(playlistId) {
  const playlist = musicDatabase.playlists.find(p => p.id === playlistId);
  if (playlist) {
    const songs = playlist.songIds.map(id => 
      musicDatabase.songs.find(s => s.id === id)
    ).filter(Boolean);
    return { success: true, playlist: { ...playlist, songs } };
  }
  return { error: 'Playlist not found', playlistId };
}

function getStats() {
  return { success: true, stats: musicDatabase.stats };
}

function addToPlaylist(playlistId, songId) {
  const playlist = musicDatabase.playlists.find(p => p.id === playlistId);
  const song = musicDatabase.songs.find(s => s.id === songId);
  
  if (!playlist) return { error: 'Playlist not found' };
  if (!song) return { error: 'Song not found' };
  
  if (!playlist.songIds.includes(songId)) {
    playlist.songIds.push(songId);
    return { success: true, message: 'Song added to playlist', playlist };
  }
  return { error: 'Song already in playlist' };
}

function getRecommendations(genre) {
  const recommendations = musicDatabase.songs.filter(s => s.genre === genre);
  return { success: true, recommendations, count: recommendations.length };
}

// Ustvari strežnik za named pipe
function startServer() {
  if (process.platform === 'win32') {
    // Windows implementacija
    const net = require('net');
    const server = net.createServer((stream) => {
      console.log('✅ Client connected');
      
      stream.on('data', (data) => {
        const request = data.toString().trim();
        if (request) {
          const response = handleRequest(request);
          stream.write(JSON.stringify(response) + '\n');
        }
      });

      stream.on('end', () => {
        console.log('❌ Client disconnected');
      });

      stream.on('error', (err) => {
        console.error('Stream error:', err.message);
      });
    });

    server.listen(PIPE_NAME, () => {
      console.log('✨ Music Server is ready and listening!');
      console.log('🎼 Available commands: GET_SONG, SEARCH_SONGS, GET_PLAYLIST, GET_STATS, ADD_TO_PLAYLIST, GET_RECOMMENDATIONS');
    });

    server.on('error', (err) => {
      console.error('Server error:', err.message);
      process.exit(1);
    });

  } else {
    // Unix/Linux/Mac implementacija
    const net = require('net');
    
    const server = net.createServer((stream) => {
      console.log('✅ Client connected');
      
      let buffer = '';
      
      stream.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Ohrani nepopolno vrstico
        
        lines.forEach(request => {
          if (request.trim()) {
            const response = handleRequest(request);
            stream.write(JSON.stringify(response) + '\n');
          }
        });
      });

      stream.on('end', () => {
        console.log('❌ Client disconnected');
      });

      stream.on('error', (err) => {
        console.error('Stream error:', err.message);
      });
    });

    server.listen(PIPE_NAME, () => {
      console.log('✨ Music Server is ready and listening!');
      console.log('🎼 Available commands: GET_SONG, SEARCH_SONGS, GET_PLAYLIST, GET_STATS, ADD_TO_PLAYLIST, GET_RECOMMENDATIONS');
    });

    server.on('error', (err) => {
      console.error('Server error:', err.message);
      process.exit(1);
    });
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (process.platform !== 'win32' && fs.existsSync(PIPE_NAME)) {
    fs.unlinkSync(PIPE_NAME);
  }
  process.exit(0);
});

startServer();