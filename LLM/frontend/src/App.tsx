import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatContent from './components/ChatContent';
import { useChat } from './hooks/useChat';
import { useSessions } from './hooks/useSessions';
import './App.css';


function App() {
  // Sessions management
  const {
    sessions,
    currentSessionId,
    selectSession,
    createNewSession,
    deleteSession,
    refreshSessions,
  } = useSessions();

  // Chat management za trenutni session
  const { messages, isLoading, sendMessage, loadHistory } =
    useChat(currentSessionId);

  /**
   * Naloži zgodovino ob menjavi sessiona
   */
  useEffect(() => {
    loadHistory();
  }, [currentSessionId, loadHistory]);

  /**
   * Handler za pošiljanje sporočila
   */
  const handleSendMessage = async (
    message: string,
    count: number,
    genre: string
  ) => {
    await sendMessage(message, count, genre);
    // Refresh sessions da se updejta sidebar
    refreshSessions();
  };

  /**
   * Handler za nov session
   */
  const handleNewSession = () => {
    createNewSession();
  };

  /**
   * Handler za izbris sessiona
   */
  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={selectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
        />

        <ChatContent
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;