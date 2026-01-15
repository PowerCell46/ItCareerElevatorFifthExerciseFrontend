import api from './api';
import type { Conversation, Message, ConversationSummaryResponseDTO } from '../types/messenger';
import authService from './authService';

class MessengerService {
    async getConversations(): Promise<Conversation[]> {
        const response = await api.get<ConversationSummaryResponseDTO[]>('/conversation');
        const currentUserId = authService.getDecodedToken()?.sub;
        
        if (!currentUserId) {
            return [];
        }

        // Transform backend DTOs to frontend Conversation format
        // Group by the other user (sender or receiver, whichever is not current user)
        const conversationMap = new Map<string, ConversationSummaryResponseDTO>();

        response.data.forEach((dto) => {
            const otherUserId = dto.senderId === currentUserId ? dto.receiverId : dto.senderId;
            const existing = conversationMap.get(otherUserId);

            // Keep the most recent message (latest createdAt)
            if (!existing || new Date(dto.createdAt) > new Date(existing.createdAt)) {
                conversationMap.set(otherUserId, dto);
            }
        });

        // Convert to Conversation array
        const conversations: Conversation[] = Array.from(conversationMap.entries()).map(([userId, dto]) => ({
            userId,
            username: userId, // Backend doesn't provide username, using userId as fallback
            lastMessage: dto.content,
            lastMessageTime: dto.createdAt,
            unreadCount: 0, // Backend doesn't provide this
        }));

        // Sort by lastMessageTime descending (most recent first)
        return conversations.sort((a, b) => {
            if (!a.lastMessageTime || !b.lastMessageTime) return 0;
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
    }

    async getMessages(userId: string): Promise<Message[]> {
        const response = await api.get<Message[]>(`/messages/${userId}`);
        return response.data;
    }
}

export const messengerService = new MessengerService();
export default messengerService;
