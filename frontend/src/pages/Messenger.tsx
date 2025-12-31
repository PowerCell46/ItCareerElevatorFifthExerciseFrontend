import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import websocketService from '../services/websocketService';
import messengerService from '../services/messengerService';
import ConversationsList from '../components/ConversationsList';
import ChatArea from '../components/ChatArea';
import type { Conversation, Message, MessageOutput, Location } from '../types/messenger';
import '../styles/messenger.css';

const Messenger = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get user location
    const getUserLocation = useCallback((): Promise<Location> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        recordedAt: position.timestamp,
                    });
                },
                (error) => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const data = await messengerService.getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Failed to load conversations');
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (userId: string) => {
        try {
            const data = await messengerService.getMessages(userId);
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages');
        }
    }, []);

    // Handle incoming WebSocket messages
    const handleIncomingMessage = useCallback(
        (messageOutput: MessageOutput) => {
            if (!selectedConversation || !user) return;

            // Convert MessageOutput to Message format
            const newMessage: Message = {
                senderId: messageOutput.from,
                receiverId: user.id,
                content: messageOutput.text,
                sentAt: new Date().toISOString(),
            };

            // Add message if it's from the selected conversation
            if (messageOutput.from === selectedConversation.userId) {
                setMessages((prev) => [...prev, newMessage]);
            }

            // Update conversation list with last message
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.userId === messageOutput.from
                        ? {
                              ...conv,
                              lastMessage: messageOutput.text,
                              lastMessageTime: new Date().toISOString(),
                          }
                        : conv
                )
            );
        },
        [selectedConversation, user]
    );

    // Send message
    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!selectedConversation || !user || !isConnected) return;

            try {
                // Get location
                let location: Location | undefined;
                try {
                    location = await getUserLocation();
                } catch (err) {
                    console.warn('Failed to get location:', err);
                    // Continue without location
                }

                const messagePayload = {
                    receiverId: selectedConversation.userId,
                    sentAt: new Date().toISOString(),
                    content,
                    ...(location && { location }),
                };

                // Send via WebSocket
                websocketService.sendMessage(messagePayload);

                // Optimistically add message to UI
                const newMessage: Message = {
                    senderId: user.id,
                    receiverId: selectedConversation.userId,
                    content,
                    sentAt: messagePayload.sentAt,
                    location,
                };

                setMessages((prev) => [...prev, newMessage]);

                // Update conversation list
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.userId === selectedConversation.userId
                            ? {
                                  ...conv,
                                  lastMessage: content,
                                  lastMessageTime: messagePayload.sentAt,
                              }
                            : conv
                    )
                );
            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message');
            }
        },
        [selectedConversation, user, isConnected, getUserLocation]
    );

    // Handle conversation selection
    const handleSelectConversation = useCallback(
        (conversation: Conversation) => {
            setSelectedConversation(conversation);
            fetchMessages(conversation.userId);
        },
        [fetchMessages]
    );

    // Initialize WebSocket connection
    useEffect(() => {
        const token = authService.getToken();
        if (!token) {
            setError('Not authenticated');
            setIsLoading(false);
            return;
        }

        // Set up WebSocket connection state callback
        websocketService.onConnectionStateChange(setIsConnected);

        // Connect to WebSocket
        websocketService
            .connect(token)
            .then(() => {
                setIsConnected(true);
                // Subscribe to messages
                websocketService.subscribeToMessages(handleIncomingMessage);
            })
            .catch((err) => {
                console.error('WebSocket connection error:', err);
                setError('Failed to connect to chat server');
                setIsConnected(false);
            })
            .finally(() => {
                setIsLoading(false);
            });

        // Cleanup on unmount
        return () => {
            websocketService.disconnect();
        };
    }, [handleIncomingMessage]);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    if (isLoading) {
        return (
            <div className="messenger-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</div>
            </div>
        );
    }

    if (error && !isConnected) {
        return (
            <div className="messenger-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{error}</div>
                <button
                    onClick={() => {
                        setError(null);
                        const token = authService.getToken();
                        if (token) {
                            websocketService.connect(token).catch(console.error);
                        }
                    }}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--color-button)',
                        color: 'var(--color-text)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="messenger-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Please log in to use messenger</div>
            </div>
        );
    }

    return (
        <div className="messenger-container">
            <ConversationsList
                conversations={conversations}
                selectedConversationId={selectedConversation?.userId || null}
                onSelectConversation={handleSelectConversation}
            />
            <ChatArea
                conversation={selectedConversation}
                messages={messages}
                currentUserId={user.id}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
            />
        </div>
    );
};

export default Messenger;
