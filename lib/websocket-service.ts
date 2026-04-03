/**
 * WebSocket Service for Game Simulator
 * Handles binary protocol communication with backend using MessagePack
 * Uses native browser WebSocket (no socket.io dependency)
 */

import { pack, unpack } from 'msgpackr';

// Message types matching backend protocol
export enum MessageType {
  // Client -> Server
  PLAY_ROUND = 1,
  GET_HISTORY = 2,
  GET_STATS = 3,
  RESET_GAME = 4,

  // Server -> Client
  ROUND_RESULT = 101,
  HISTORY_RESPONSE = 102,
  STATS_RESPONSE = 103,
  ERROR = 104,
  STATE_UPDATE = 105,
}

// Risk level enum (matching backend)
export enum RiskLevel {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  MAX = 3,
}

// Map frontend string to backend enum
export const RISK_LEVEL_MAP: Record<string, RiskLevel> = {
  low: RiskLevel.LOW,
  medium: RiskLevel.MEDIUM,
  high: RiskLevel.HIGH,
  max: RiskLevel.MAX,
};

// Backend response types
export interface GameStats {
  totalRounds: number;
  wins: number;
  losses: number;
  totalWagered: number;
  totalPayout: number;
  netPnL: number;
  winRate: number;
}

export interface GameRound {
  roundId: number;
  timestamp: number;
  riskLevel: RiskLevel;
  betAmount: number;
  isWin: boolean;
  multiplier: number;
  payout: number;
  balanceAfter: number;
}

export interface RoundResultResponse {
  type: MessageType.ROUND_RESULT;
  roundId: number;
  timestamp: number;
  isWin: boolean;
  multiplier: number;
  payout: number;
  balanceAfter: number;
  stats: GameStats;
}

export interface HistoryResponse {
  type: MessageType.HISTORY_RESPONSE;
  rounds: GameRound[];
}

export interface StatsResponse {
  type: MessageType.STATS_RESPONSE;
  stats: GameStats;
}

export interface ErrorResponse {
  type: MessageType.ERROR;
  code: number;
  message: string;
}

export interface StateUpdateResponse {
  type: MessageType.STATE_UPDATE;
  balance: number;
  roundCount: number;
  stats: GameStats;
}

// Event handler types
export type RoundResultHandler = (data: RoundResultResponse) => void;
export type HistoryHandler = (data: HistoryResponse) => void;
export type StatsHandler = (data: StatsResponse) => void;
export type ErrorHandler = (data: ErrorResponse) => void;
export type StateUpdateHandler = (data: StateUpdateResponse) => void;
export type ConnectionHandler = (connected: boolean) => void;

/**
 * WebSocket Service Class
 * Manages connection, encoding/decoding, and message routing
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  // Event handlers
  private onRoundResult: RoundResultHandler | null = null;
  private onHistory: HistoryHandler | null = null;
  private onStats: StatsHandler | null = null;
  private onError: ErrorHandler | null = null;
  private onStateUpdate: StateUpdateHandler | null = null;
  private onConnectionChange: ConnectionHandler | null = null;

  constructor(url?: string) {
    const baseUrl = url || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    // Convert http(s) to ws(s) for native WebSocket
    this.url = baseUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.intentionalClose = false;
    this.doConnect();
  }

  private doConnect(): void {
    console.log(`Connecting to WebSocket at ${this.url}`);

    try {
      this.socket = new WebSocket(this.url);
      this.socket.binaryType = 'arraybuffer';
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyConnectionChange(true);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.notifyConnectionChange(false);

      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.doConnect();
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.intentionalClose = true;

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.notifyConnectionChange(false);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming binary message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = unpack(new Uint8Array(event.data as ArrayBuffer)) as { type: number };

      switch (data.type) {
        case MessageType.ROUND_RESULT:
          if (this.onRoundResult) {
            this.onRoundResult(data as unknown as RoundResultResponse);
          }
          break;

        case MessageType.HISTORY_RESPONSE:
          if (this.onHistory) {
            this.onHistory(data as unknown as HistoryResponse);
          }
          break;

        case MessageType.STATS_RESPONSE:
          if (this.onStats) {
            this.onStats(data as unknown as StatsResponse);
          }
          break;

        case MessageType.ERROR:
          console.error('Server error:', data);
          if (this.onError) {
            this.onError(data as unknown as ErrorResponse);
          }
          break;

        case MessageType.STATE_UPDATE:
          if (this.onStateUpdate) {
            this.onStateUpdate(data as unknown as StateUpdateResponse);
          }
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error decoding binary message:', error);
    }
  }

  /**
   * Send binary message to server
   */
  private sendBinary(message: object): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    try {
      const buffer = pack(message);
      this.socket!.send(buffer);
    } catch (error) {
      console.error('Error encoding message:', error);
      throw error;
    }
  }

  /**
   * API Methods
   */

  /**
   * Play a game round
   * @param betAmount - Bet amount in cents
   * @param riskLevel - Risk level string ('low', 'medium', 'high', 'max')
   */
  playRound(betAmount: number, riskLevel: string): void {
    const message = {
      type: MessageType.PLAY_ROUND,
      betAmount,
      riskLevel: RISK_LEVEL_MAP[riskLevel],
    };
    this.sendBinary(message);
  }

  /**
   * Get game history
   * @param limit - Number of rounds to fetch
   */
  getHistory(limit: number = 50): void {
    const message = {
      type: MessageType.GET_HISTORY,
      limit,
    };
    this.sendBinary(message);
  }

  /**
   * Get game statistics
   */
  getStats(): void {
    const message = {
      type: MessageType.GET_STATS,
    };
    this.sendBinary(message);
  }

  /**
   * Reset game session
   * @param initialBalance - New starting balance in cents
   */
  resetGame(initialBalance: number): void {
    const message = {
      type: MessageType.RESET_GAME,
      initialBalance,
    };
    this.sendBinary(message);
  }

  /**
   * Event handler registration
   */

  setRoundResultHandler(handler: RoundResultHandler): void {
    this.onRoundResult = handler;
  }

  setHistoryHandler(handler: HistoryHandler): void {
    this.onHistory = handler;
  }

  setStatsHandler(handler: StatsHandler): void {
    this.onStats = handler;
  }

  setErrorHandler(handler: ErrorHandler): void {
    this.onError = handler;
  }

  setStateUpdateHandler(handler: StateUpdateHandler): void {
    this.onStateUpdate = handler;
  }

  setConnectionChangeHandler(handler: ConnectionHandler): void {
    this.onConnectionChange = handler;
  }

  /**
   * Notify connection change
   */
  private notifyConnectionChange(connected: boolean): void {
    if (this.onConnectionChange) {
      this.onConnectionChange(connected);
    }
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

/**
 * Get or create WebSocket service instance
 */
export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService();
  }
  return wsService;
}
