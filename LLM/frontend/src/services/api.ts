import {
  SongsResponse,
  HistoryResponse,
  SessionsResponse,
  SongRequest,
} from '../types';


class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

 
  private async fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Napaka pri pridobivanju podatkov');
      }

      return await response.json();
    } catch (error) {
      console.error('API napaka:', error);
      throw error;
    }
  }

  /**
   * Pridobi priporočila pesmi
   */
  async getSongRecommendations(
    request: SongRequest
  ): Promise<SongsResponse> {
    return this.fetchWithErrorHandling<SongsResponse>('/api/songs', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Pridobi zgodovino za session
   */
  async getHistory(sessionId: string): Promise<HistoryResponse> {
    return this.fetchWithErrorHandling<HistoryResponse>(
      `/api/history/${sessionId}`
    );
  }

  /**
   * Pridobi vse sessions
   */
  async getAllSessions(): Promise<SessionsResponse> {
    return this.fetchWithErrorHandling<SessionsResponse>('/api/history');
  }

  /**
   * Izbriši session
   */
  async deleteSession(sessionId: string): Promise<void> {
    return this.fetchWithErrorHandling<void>(`/api/history/${sessionId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();