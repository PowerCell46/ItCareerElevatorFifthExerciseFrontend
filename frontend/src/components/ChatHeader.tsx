interface ChatHeaderProps {
    username: string;
}

const ChatHeader = ({ username }: ChatHeaderProps) => {
    return (
        <div className="chat-header">
            <div className="chat-user-info">
                <div className="chat-avatar">
                    <i className="fa-solid fa-user"></i>
                </div>
                <div className="chat-user-details">
                    <h3>{username}</h3>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
