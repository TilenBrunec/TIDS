import { useState, useCallback } from 'react';
import { Message, Song } from '../types';
import ApiService from '../services/api';

/**
 * Custom Hook za upravljanje chat stanja in logike
 */
export const useChat = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content:
        'Živjo! 🎵 Sem tvoj glasbeni asistent. Izberi število pesmi, žanr in napiši svoje želje...',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Dodaj novo sporočilo
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Pošlji sporočilo in pridobi priporočila
   */
  const sendMessage = useCallback(
    async (inputValue: string, songCount: number, genre: string) => {
      if (!inputValue.trim() || isLoading) return;

      // User message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `(${songCount} pesmi, žanr: ${genre}) ${inputValue}`,
        timestamp: new Date(),
      };

      addMessage(userMessage);
      setIsLoading(true);

      try {
        // API klic
        const data = await ApiService.getSongRecommendations({
          message: inputValue,
          count: songCount,
          genre: genre,
          sessionId: sessionId,
        });

        // Bot odgovor
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Super! Našel sem ${data.songs.length} ${getSongCountText(
            data.songs.length
          )} (${genre}):`,
          songs: data.songs,
          timestamp: new Date(),
        };

        addMessage(botMessage);
      } catch (error) {
        // Error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content:
            'Oprostite, prišlo je do napake. Prosim, poskusite znova.',
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, addMessage]
  );

  /**
   * Naloži zgodovino
   */
  const loadHistory = useCallback(async () => {
    try {
      const history = await ApiService.getHistory(sessionId);
      if (history.messages && history.messages.length > 0) {
        // Konvertiraj timestamp stringe v Date objekte
        const formattedMessages = history.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Napaka pri nalaganju zgodovine:', error);
    }
  }, [sessionId]);

  return {
    messages,
    isLoading,
    sendMessage,
    loadHistory,
  };
};

/**
 * Helper funkcija za pravilno sklanjanje
 */
function getSongCountText(count: number): string {
  if (count === 1) return 'pesem';
  if (count === 2) return 'pesmi';
  if (count === 3 || count === 4) return 'pesmi';
  return 'pesmi';
}