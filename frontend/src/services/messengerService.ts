import api from './api';
import type { Conversation, Message } from '../types/messenger';

class MessengerService {
    async getConversations(): Promise<Conversation[]> {
        const response = await api.get<Conversation[]>('/conversations');
        return response.data;
    }

    async getMessages(userId: string): Promise<Message[]> {
        const response = await api.get<Message[]>(`/messages/${userId}`);
        return response.data;
    }
}

export const messengerService = new MessengerService();
export default messengerService;
