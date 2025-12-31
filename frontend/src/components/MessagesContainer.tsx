import { useEffect, useRef } from 'react';
import type { Message } from '../types/messenger';
import MessageBubble from './MessageBubble';

interface MessagesContainerProps {
    messages: Message[];
    currentUserId: string;
}

const MessagesContainer = ({ messages, currentUserId }: MessagesContainerProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="messages-container">
            {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '2rem' }}>
                    No messages yet. Start the conversation!
                </div>
            ) : (
                <>
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={message.id || index}
                            message={message}
                            currentUserId={currentUserId}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
};

export default MessagesContainer;
