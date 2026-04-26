/**
 * API Client for U-Scout Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface LoginRequest {
  name: string;
  password: string;
  teamKey: string;
  role: 'coach' | 'player';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  name: string;
  role: string;
  token: string;
}

export interface Match {
  id: string;
  name: string;
  country: string;
  formation: string;
  form: ('W' | 'D' | 'L')[];
  avgPossession: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgShotsOnTarget: number;
  pressingIntensity: number;
  setPieceThreat: string;
  coachNote: string;
  dateAnalyzed: string;
  competition: string;
  matchDate: string;
  players: any[];
}

export interface MatchSummary {
  id: string;
  opponentName: string;
  country: string;
  formation: string;
  dateAnalyzed: string;
  form: ('W' | 'D' | 'L')[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth endpoints
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Match endpoints
  async getNextMatch(): Promise<Match> {
    return this.request<Match>('/matches/next');
  }

  async getRecentAnalyses(): Promise<MatchSummary[]> {
    return this.request<MatchSummary[]>('/matches/recent');
  }

  async getAllMatches(): Promise<any[]> {
    return this.request<any[]>('/matches');
  }

  async getMatchDetail(matchId: string): Promise<Match> {
    return this.request<Match>(`/matches/${matchId}`);
  }

  // AI Analysis endpoints
  async getPlayerAnalysis(playerName: string): Promise<any> {
    return this.request<any>(`/ai/analyze/${encodeURIComponent(playerName)}`);
  }

  async comparePlayersAnalysis(player1: string, player2: string): Promise<any> {
    return this.request<any>(`/ai/compare?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}`);
  }

  async getMatchAnalysis(matchName: string): Promise<any> {
    return this.request<any>(`/ai/analyze/${encodeURIComponent(matchName)}`);
  }

  async getPlayerStats(playerName: string): Promise<any> {
    return this.request<any>(`/ai/stats/${encodeURIComponent(playerName)}`);
  }
}

export const apiClient = new ApiClient();
