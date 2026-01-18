import { useEffect, useState } from 'react';
import '../styles/notification.css';

interface NotificationPopupProps {
    message: {
        from: string;
        text: string;
        username?: string;
    } | null;
    onClose: () => void;
    onClick?: () => void;
}

const NotificationPopup = ({ message, onClose, onClick }: NotificationPopupProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for animation to complete
            }, 5000); // Show for 5 seconds

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        onClose();
    };

    return (
        <div className={`notification-popup ${isVisible ? 'visible' : ''}`} onClick={handleClick}>
            <div className="notification-content">
                <div className="notification-header">
                    <div className="notification-avatar">
                        {message.username?.[0]?.toUpperCase() || message.from[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="notification-info">
                        <div className="notification-sender">
                            {message.username || message.from}
                        </div>
                        <div className="notification-time">Just now</div>
                    </div>
                </div>
                <div className="notification-message">{message.text}</div>
            </div>
        </div>
    );
};

export default NotificationPopup;
