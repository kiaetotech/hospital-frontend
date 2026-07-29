// D:\hospital-frontend\src\ai-control-center\services\MonitoringClient.ts

type DataListener = (data: any) => void;
type StatusListener = (status: 'connected' | 'disconnected' | 'reconnecting') => void;

export interface MonitoringData {
  timestamp: Date;
  agents: Record<string, any>;
  systemHealth: {
    mongodb: 'healthy' | 'degraded' | 'unhealthy';
    redis: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  };
  totalCostToday: number;
  totalRequestsToday: number;
  activeAgentsCount: number;
}

export class MonitoringClient {
  private ws: WebSocket | null = null;
  private listeners: DataListener[] = [];
  private statusListeners: StatusListener[] = [];
  private reconnectInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private isConnecting: boolean = false;
  private wsUrl: string;
  private lastData: MonitoringData | null = null;

  constructor(wsUrl?: string) {
    this.wsUrl = wsUrl || process.env.REACT_APP_WS_URL || 'ws://localhost:8081/monitoring';
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.isConnecting) {
      console.log('⚠️ Already connecting...');
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('⚠️ WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    this.notifyStatus('reconnecting');

    try {
      console.log(`🔌 Connecting to WebSocket: ${this.wsUrl}`);
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyStatus('connected');
        this.clearReconnectInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.lastData = data;
          for (const listener of this.listeners) {
            listener(data);
          }
        } catch (error) {
          console.error('❌ Failed to parse monitoring data:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.warn(`⚠️ WebSocket closed: ${event.code} - ${event.reason}`);
        this.isConnecting = false;
        this.notifyStatus('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('❌ Failed to connect:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      this.notifyStatus('disconnected');
      return;
    }

    this.clearReconnectInterval();

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectInterval = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Clear reconnect interval
   */
  private clearReconnectInterval(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.clearReconnectInterval();
    this.reconnectAttempts = 0;
    this.isConnecting = false;

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.notifyStatus('disconnected');
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Send message to server
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not open');
    }
  }

  /**
   * Register data listener
   */
  onData(listener: DataListener): void {
    this.listeners.push(listener);
    
    // If we have cached data, send it immediately
    if (this.lastData) {
      listener(this.lastData);
    }
  }

  /**
   * Register status listener
   */
  onStatus(listener: StatusListener): void {
    this.statusListeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: DataListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Remove status listener
   */
  removeStatusListener(listener: StatusListener): void {
    this.statusListeners = this.statusListeners.filter(l => l !== listener);
  }

  /**
   * Notify status listeners
   */
  private notifyStatus(status: 'connected' | 'disconnected' | 'reconnecting'): void {
    for (const listener of this.statusListeners) {
      try {
        listener(status);
      } catch (error) {
        console.error('Status listener error:', error);
      }
    }
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnecting) {
      return 'connecting';
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return 'connected';
    }
    return 'disconnected';
  }

  /**
   * Get last received data
   */
  getLastData(): MonitoringData | null {
    return this.lastData;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Ping server to keep connection alive
   */
  ping(): void {
    if (this.isConnected()) {
      this.send({ type: 'ping', timestamp: Date.now() });
    }
  }

  /**
   * Request specific data from server
   */
  requestData(type: string, params?: any): void {
    this.send({
      type: 'request',
      dataType: type,
      params: params || {}
    });
  }

  /**
   * Request agent status for specific agent
   */
  requestAgentStatus(agentId: string): void {
    this.requestData('agentStatus', { agentId });
  }

  /**
   * Request cost summary
   */
  requestCostSummary(): void {
    this.requestData('costSummary');
  }

  /**
   * Request health status
   */
  requestHealthStatus(): void {
    this.requestData('healthStatus');
  }

  /**
   * Subscribe to specific data updates
   */
  subscribe(channel: string): void {
    this.send({
      type: 'subscribe',
      channel
    });
  }

  /**
   * Unsubscribe from specific data updates
   */
  unsubscribe(channel: string): void {
    this.send({
      type: 'unsubscribe',
      channel
    });
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners = [];
    this.statusListeners = [];
  }
}

/**
 * Create singleton instance
 */
let monitoringClientInstance: MonitoringClient | null = null;

export function getMonitoringClient(wsUrl?: string): MonitoringClient {
  if (!monitoringClientInstance) {
    monitoringClientInstance = new MonitoringClient(wsUrl);
  }
  return monitoringClientInstance;
}