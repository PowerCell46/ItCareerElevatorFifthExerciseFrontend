import type { Message, Conversation } from '../types/messenger';
import ChatHeader from './ChatHeader';
import MessagesContainer from './MessagesContainer';
import ChatInputArea from './ChatInputArea';

interface ChatAreaProps {
    conversation: Conversation | null;
    messages: Message[];
    currentUserId: string;
    onSendMessage: (content: string) => Promise<void>;
    isConnected: boolean;
}

const ChatArea = ({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    isConnected,
}: ChatAreaProps) => {
    if (!conversation) {
        return (
            <main className="chat-area">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'rgba(255, 255, 255, 0.5)',
                }}>
                    Select a conversation to start messaging
                </div>
            </main>
        );
    }

    return (
        <main className="chat-area">
            <ChatHeader username={conversation.username} />
            <MessagesContainer messages={messages} currentUserId={currentUserId} />
            <ChatInputArea onSendMessage={onSendMessage} disabled={!isConnected} />
        </main>
    );
};

export default ChatArea;
