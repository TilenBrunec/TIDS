export interface Song {
  title: string;
  artist: string;
  genre: string;
  link: string;
}

// Message tip
export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  songs?: Song[];
  timestamp: Date;
}

// API Response tipi
export interface SongsResponse {
  songs: Song[];
}

export interface HistoryResponse {
  sessionId: string;
  messages: Message[];
  lastActivity: string;
  totalMessages: number;
}

export interface SessionPreview {
  sessionId: string;
  lastActivity: string;
  messageCount: number;
  preview: string;
}

export interface SessionsResponse {
  sessions: SessionPreview[];
  total: number;
}

// Request tipi
export interface SongRequest {
  message: string;
  count: number;
  genre: string;
  sessionId?: string;
}

// Chat State
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sessionId: string;
}