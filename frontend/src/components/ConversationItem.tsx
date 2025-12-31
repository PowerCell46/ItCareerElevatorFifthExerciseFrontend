import type { Conversation } from '../types/messenger';
import { formatRelativeTime } from '../utils/timeUtils';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}

const ConversationItem = ({ conversation, isActive, onClick }: ConversationItemProps) => {
    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="conversation-avatar">
                <i className="fa-solid fa-user"></i>
            </div>
            <div className="conversation-info">
                <div className="conversation-name">{conversation.username}</div>
                {conversation.lastMessage && (
                    <div className="conversation-last-message">
                        {conversation.lastMessage}
                    </div>
                )}
            </div>
            {conversation.lastMessageTime && (
                <div className="conversation-meta">
                    <span className="conversation-time">
                        {formatRelativeTime(conversation.lastMessageTime)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ConversationItem;
