import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { MessageOutput, SendMessagePayload } from '../types/messenger';

class WebSocketService {
    private client: Client | null = null;
    private messageCallback: ((message: MessageOutput) => void) | null = null;
    private connectionStateCallback: ((connected: boolean) => void) | null = null;
    private subscription: any = null;

    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error('Token is required'));
                return;
            }

            const wsUrl = `http://localhost:8080/ws-endpoint?token=${encodeURIComponent(token)}`;

            this.client = new Client({
                webSocketFactory: () => {
                    return new SockJS(wsUrl) as any;
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('WebSocket connected');
                    this.connectionStateCallback?.(true);

                    // Subscribe to messages
                    if (this.client && this.messageCallback) {
                        this.subscribeToMessages(this.messageCallback);
                    }

                    resolve();
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                    this.connectionStateCallback?.(false);
                    reject(new Error('STOMP connection error'));
                },
                onWebSocketClose: () => {
                    console.log('WebSocket closed');
                    this.connectionStateCallback?.(false);
                },
                onDisconnect: () => {
                    console.log('WebSocket disconnected');
                    this.connectionStateCallback?.(false);
                    this.subscription = null;
                },
            });

            this.client.activate();
        });
    }

    disconnect(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }

        this.messageCallback = null;
        this.connectionStateCallback = null;
    }

    sendMessage(message: SendMessagePayload): void {
        if (!this.client || !this.client.connected) {
            throw new Error('WebSocket is not connected');
        }

        this.client.publish({
            destination: '/ws/message',
            body: JSON.stringify(message),
        });
    }

    subscribeToMessages(callback: (message: MessageOutput) => void): void {
        this.messageCallback = callback;

        // If already connected, subscribe immediately
        if (this.client?.connected) {
            // Unsubscribe existing subscription if any
            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            this.subscription = this.client.subscribe('/topic/messages', (message) => {
                try {
                    const messageOutput: MessageOutput = JSON.parse(message.body);
                    callback(messageOutput);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });
        }
    }

    onConnectionStateChange(callback: (connected: boolean) => void): void {
        this.connectionStateCallback = callback;
    }

    isConnected(): boolean {
        return this.client?.connected ?? false;
    }
}

export const websocketService = new WebSocketService();
export default websocketService;
