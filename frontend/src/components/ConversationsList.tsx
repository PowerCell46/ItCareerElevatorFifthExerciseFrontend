import type { Conversation } from '../types/messenger';
import ConversationItem from './ConversationItem';

interface ConversationsListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (conversation: Conversation) => void;
    onNewMessageClick: () => void;
    onLogout: () => void;
}

const ConversationsList = ({
    conversations,
    selectedConversationId,
    onSelectConversation,
    onNewMessageClick,
    onLogout,
}: ConversationsListProps) => {
    return (
        <aside className="conversations-sidebar">
            <div className="sidebar-header">
                <h2>Chats</h2>
                <div className="sidebar-header-actions">
                    <i className="fa-solid fa-pen-to-square" onClick={onNewMessageClick} title="New message"></i>
                    <button className="logout-button" onClick={onLogout} title="Logout">
                        <i className="fa-solid fa-sign-out-alt"></i>
                    </button>
                </div>
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
