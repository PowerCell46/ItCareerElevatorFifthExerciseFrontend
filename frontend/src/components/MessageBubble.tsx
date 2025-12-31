import type { Message } from '../types/messenger';
import { formatMessageTime } from '../utils/timeUtils';

interface MessageBubbleProps {
    message: Message;
    currentUserId: string;
}

const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
    const isSent = message.senderId === currentUserId;
    const messageClass = isSent ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <div className="message-content">
                <p>{message.content}</p>
            </div>
            <span className="message-time">{formatMessageTime(message.sentAt)}</span>
        </div>
    );
};

export default MessageBubble;
