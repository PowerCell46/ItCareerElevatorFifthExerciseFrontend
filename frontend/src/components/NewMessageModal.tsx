import { useState, FormEvent } from 'react';

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (userId: string, message: string) => Promise<void>;
    isConnected: boolean;
}

const NewMessageModal = ({ isOpen, onClose, onSendMessage, isConnected }: NewMessageModalProps) => {
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!userId.trim() || !message.trim()) {
            setError('Please enter both user ID and message');
            return;
        }

        if (!isConnected) {
            setError('WebSocket is not connected');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            await onSendMessage(userId.trim(), message.trim());
            // Reset form and close modal on success
            setUserId('');
            setMessage('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        if (!isSending) {
            setUserId('');
            setMessage('');
            setError(null);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>New Message</h3>
                    <button className="modal-close" onClick={handleClose} disabled={isSending}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-field">
                        <label htmlFor="userId">User ID</label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="Enter user ID"
                            disabled={isSending || !isConnected}
                            required
                        />
                    </div>

                    <div className="modal-field">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message"
                            rows={4}
                            disabled={isSending || !isConnected}
                            required
                        />
                    </div>

                    {error && (
                        <div className="modal-error">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSending}
                            className="modal-button modal-button-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || !isConnected || !userId.trim() || !message.trim()}
                            className="modal-button modal-button-primary"
                        >
                            {isSending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewMessageModal;
