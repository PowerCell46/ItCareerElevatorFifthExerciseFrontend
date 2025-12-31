export interface Location {
    latitude: number;
    longitude: number;
    recordedAt: number; // timestamp
}

export interface Message {
    id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string; // ISO string
    location?: Location;
}

export interface Conversation {
    userId: string;
    username: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

export interface MessageOutput {
    from: string;
    text: string;
    time: string;
}

export interface SendMessagePayload {
    receiverId: string;
    sentAt: string; // ISO string
    content: string;
    location?: Location;
}
