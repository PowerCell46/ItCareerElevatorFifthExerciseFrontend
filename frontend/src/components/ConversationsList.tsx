import type { Conversation } from '../types/messenger';
import ConversationItem from './ConversationItem';

interface ConversationsListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (conversation: Conversation) => void;
}

const ConversationsList = ({
    conversations,
    selectedConversationId,
    onSelectConversation,
}: ConversationsListProps) => {
    return (
        <aside className="conversations-sidebar">
            <div className="sidebar-header">
                <h2>Chats</h2>
                <i className="fa-solid fa-pen-to-square"></i>
            </div>

            <div className="conversations-list">
                {conversations.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <ConversationItem
                            key={conversation.userId}
                            conversation={conversation}
                            isActive={conversation.userId === selectedConversationId}
                            onClick={() => onSelectConversation(conversation)}
                        />
                    ))
                )}
            </div>
        </aside>
    );
};

export default ConversationsList;
