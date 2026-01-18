import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import websocketService from '../services/websocketService';
import messengerService from '../services/messengerService';
import ConversationsList from '../components/ConversationsList';
import ChatArea from '../components/ChatArea';
import NewMessageModal from '../components/NewMessageModal';
import NotificationPopup from '../components/NotificationPopup';
import type { Conversation, Message, MessageOutput, Location } from '../types/messenger';
import '../styles/messenger.css';
import '../styles/notification.css';

const Messenger = () => {
    const { user, logout } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
    const [notification, setNotification] = useState<{ from: string; text: string; username?: string } | null>(null);

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
            if (!user) return;

            // Convert MessageOutput to Message format
            const newMessage: Message = {
                senderId: messageOutput.from,
                receiverId: user.id,
                content: messageOutput.text,
                sentAt: messageOutput.time || new Date().toISOString(),
            };

            // Find the conversation to get username
            const conversation = conversations.find((conv) => conv.userId === messageOutput.from);
            const username = conversation?.username || messageOutput.from;

            // Show notification for all incoming messages
            setNotification({
                from: messageOutput.from,
                text: messageOutput.text,
                username: username,
            });

            // Add message to active chat if it's from the selected conversation
            if (selectedConversation && messageOutput.from === selectedConversation.userId) {
                setMessages((prev) => [...prev, newMessage]);
            }

            // Update or create conversation in the list
            setConversations((prev) => {
                const existingIndex = prev.findIndex((conv) => conv.userId === messageOutput.from);
                
                if (existingIndex >= 0) {
                    // Update existing conversation
                    return prev.map((conv) =>
                        conv.userId === messageOutput.from
                            ? {
                                  ...conv,
                                  lastMessage: messageOutput.text,
                                  lastMessageTime: messageOutput.time || new Date().toISOString(),
                              }
                            : conv
                    );
                } else {
                    // Create new conversation
                    const newConversation: Conversation = {
                        userId: messageOutput.from,
                        username: messageOutput.from, // Will be updated when we fetch conversations
                        lastMessage: messageOutput.text,
                        lastMessageTime: messageOutput.time || new Date().toISOString(),
                        unreadCount: 0,
                    };
                    return [newConversation, ...prev];
                }
            });
        },
        [selectedConversation, user, conversations]
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

    // Handle logout
    const handleLogout = useCallback(() => {
        websocketService.disconnect();
        logout();
    }, [logout]);

    // Handle sending message to a new user
    const handleSendMessageToUser = useCallback(
        async (userId: string, content: string) => {
            if (!user || !isConnected) {
                throw new Error('Not connected or not authenticated');
            }

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
                    receiverId: userId,
                    sentAt: new Date().toISOString(),
                    content,
                    ...(location && { location }),
                };

                // Send via WebSocket
                websocketService.sendMessage(messagePayload);

                // Check if conversation already exists
                let conversation = conversations.find((conv) => conv.userId === userId);

                if (!conversation) {
                    // Create new conversation
                    conversation = {
                        userId,
                        username: userId, // Will be updated when we fetch conversations
                        lastMessage: content,
                        lastMessageTime: messagePayload.sentAt,
                        unreadCount: 0,
                    };
                    setConversations((prev) => [conversation!, ...prev]);
                } else {
                    // Update existing conversation
                    setConversations((prev) =>
                        prev.map((conv) =>
                            conv.userId === userId
                                ? {
                                      ...conv,
                                      lastMessage: content,
                                      lastMessageTime: messagePayload.sentAt,
                                  }
                                : conv
                        )
                    );
                }

                // Select the conversation and load messages
                setSelectedConversation(conversation);
                await fetchMessages(userId);

                // Optimistically add message to UI
                const newMessage: Message = {
                    senderId: user.id,
                    receiverId: userId,
                    content,
                    sentAt: messagePayload.sentAt,
                    location,
                };
                setMessages((prev) => [...prev, newMessage]);
            } catch (err) {
                console.error('Error sending message to user:', err);
                throw err;
            }
        },
        [user, isConnected, getUserLocation, conversations, fetchMessages]
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
                onNewMessageClick={() => setIsNewMessageModalOpen(true)}
                onLogout={handleLogout}
            />
            <ChatArea
                conversation={selectedConversation}
                messages={messages}
                currentUserId={user.id}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
            />
            <NewMessageModal
                isOpen={isNewMessageModalOpen}
                onClose={() => setIsNewMessageModalOpen(false)}
                onSendMessage={handleSendMessageToUser}
                isConnected={isConnected}
            />
            <NotificationPopup
                message={notification}
                onClose={() => setNotification(null)}
                onClick={() => {
                    if (notification) {
                        const conversation = conversations.find((conv) => conv.userId === notification.from);
                        if (conversation) {
                            handleSelectConversation(conversation);
                        }
                    }
                }}
            />
        </div>
    );
};

export default Messenger;
