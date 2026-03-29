/**
 * WebSocket Service for Game Simulator
 * Handles binary protocol communication with backend using MessagePack
 */

import { io, Socket } from 'socket.io-client';
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
  private socket: Socket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second

  // Event handlers
  private onRoundResult: RoundResultHandler | null = null;
  private onHistory: HistoryHandler | null = null;
  private onStats: StatsHandler | null = null;
  private onError: ErrorHandler | null = null;
  private onStateUpdate: StateUpdateHandler | null = null;
  private onConnectionChange: ConnectionHandler | null = null;

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log(`Connecting to WebSocket at ${this.url}`);

    this.socket = io(this.url, {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.notifyConnectionChange(false);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.notifyConnectionChange(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyConnectionChange(false);
      }
    });

    // Binary message handler - backend sends responses via 'binary' named event
    this.socket.on('binary', (buffer: ArrayBuffer | Buffer) => {
      this.handleBinaryMessage(buffer);
    });
  }

  /**
   * Handle incoming binary message
   */
  private handleBinaryMessage(buffer: ArrayBuffer | Buffer): void {
    try {
      // Decode MessagePack binary data
      const data = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
      const raw = unpack(data) as { type: number };

      // Route to appropriate handler based on message type
      switch (raw.type) {
        case MessageType.ROUND_RESULT:
          if (this.onRoundResult) {
            this.onRoundResult(raw as unknown as RoundResultResponse);
          }
          break;

        case MessageType.HISTORY_RESPONSE:
          if (this.onHistory) {
            this.onHistory(raw as unknown as HistoryResponse);
          }
          break;

        case MessageType.STATS_RESPONSE:
          if (this.onStats) {
            this.onStats(raw as unknown as StatsResponse);
          }
          break;

        case MessageType.ERROR:
          console.error('Server error:', raw);
          if (this.onError) {
            this.onError(raw as unknown as ErrorResponse);
          }
          break;

        case MessageType.STATE_UPDATE:
          if (this.onStateUpdate) {
            this.onStateUpdate(raw as unknown as StateUpdateResponse);
          }
          break;

        default:
          console.warn('Unknown message type:', raw.type);
      }
    } catch (error) {
      console.error('Error decoding binary message:', error);
    }
  }

  /**
   * Send binary message to server.
   * The backend intercepts raw engine.io message packets where
   * packet.data is a Buffer. Using socket.send() with a Buffer
   * sends a socket.io MESSAGE type packet at the engine.io level,
   * making packet.data a Buffer on the server side.
   */
  private sendBinary(message: object): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    try {
      const buffer = pack(message);
      // Use send() instead of emit() so the server receives a raw
      // engine.io 'message' packet with packet.data as a Buffer
      this.socket.send(buffer);
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
