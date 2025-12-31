import { useState, FormEvent } from 'react';

interface ChatInputAreaProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
}

const ChatInputArea = ({ onSendMessage, disabled = false }: ChatInputAreaProps) => {
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            await onSendMessage(message.trim());
            setMessage('');
        }
    };

    return (
        <div className="chat-input-area">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, gap: '0.75rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="message-input"
                    placeholder="Aa"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={disabled}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={disabled || !message.trim()}
                >
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
};

export default ChatInputArea;
