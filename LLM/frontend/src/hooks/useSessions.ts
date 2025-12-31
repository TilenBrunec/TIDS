import { useState, useEffect, useCallback } from 'react';
import { SessionPreview } from '../types';
import ApiService from '../services/api';

/**
 * Custom Hook za upravljanje sessions
 */
export const useSessions = () => {
  const [sessions, setSessions] = useState<SessionPreview[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    // Pridobi iz localStorage ali kreiraj novega
    return localStorage.getItem('sessionId') || generateSessionId();
  });

  /**
   * Naloži vse sessions
   */
  const loadSessions = useCallback(async () => {
    try {
      const data = await ApiService.getAllSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Napaka pri nalaganju sessions:', error);
    }
  }, []);

  /**
   * Izberi session
   */
  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    localStorage.setItem('sessionId', sessionId);
  }, []);

  /**
   * Kreiraj nov session
   */
  const createNewSession = useCallback(() => {
    const newSessionId = generateSessionId();
    selectSession(newSessionId);
    return newSessionId;
  }, [selectSession]);

  /**
   * Izbriši session
   */
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await ApiService.deleteSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));

        // Če brišemo trenutni session, kreiraj novega
        if (sessionId === currentSessionId) {
          createNewSession();
        }
      } catch (error) {
        console.error('Napaka pri brisanju sessiona:', error);
      }
    },
    [currentSessionId, createNewSession]
  );

  // Naloži sessions ob mountu
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSessionId,
    selectSession,
    createNewSession,
    deleteSession,
    refreshSessions: loadSessions,
  };
};

/**
 * Generira unikatni session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}