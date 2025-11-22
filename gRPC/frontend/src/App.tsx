import React, { useState } from 'react';
import './App.css';
import AddSong from './components/AddSong';
import SongList from './components/SongList';
import SingleSong from './components/SingleSong';
import StreamingSongs from './components/StreamingSongs';

function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'single' | 'stream'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSongAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Upravljanje s Pesmimi - gRPC Demo</h1>
        <p>Node.js gRPC strežnik + React TypeScript odjemalec</p>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'list' ? 'active' : ''} 
          onClick={() => setActiveTab('list')}
        >
          📋 Vse pesmi
        </button>
        <button 
          className={activeTab === 'add' ? 'active' : ''} 
          onClick={() => setActiveTab('add')}
        >
          ➕ Dodaj pesem
        </button>
        <button 
          className={activeTab === 'single' ? 'active' : ''} 
          onClick={() => setActiveTab('single')}
        >
          🔍 Išči pesem
        </button>
        <button 
          className={activeTab === 'stream' ? 'active' : ''} 
          onClick={() => setActiveTab('stream')}
        >
          🎶 Streaming po žanru
        </button>
      </nav>

      <main className="content">
        {activeTab === 'add' && <AddSong onSongAdded={handleSongAdded} />}
        {activeTab === 'list' && <SongList refreshTrigger={refreshTrigger} />}
        {activeTab === 'single' && <SingleSong />}
        {activeTab === 'stream' && <StreamingSongs />}
      </main>

      <footer className="App-footer">
        <p>gRPC komunikacija: Backend (50051) → Client API (3001) → React Frontend (3000)</p>
      </footer>
    </div>
  );
}

export default App;