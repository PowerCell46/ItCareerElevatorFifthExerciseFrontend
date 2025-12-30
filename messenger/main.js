// Messenger functionality will be implemented here
const sendButton = document.querySelector(".send-button");
const messageInput = document.querySelector(".message-input");
const messagesContainer = document.querySelector(".messages-container");

if (sendButton && messageInput) {
    sendButton.addEventListener("click", handleSendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendMessage(e);
        }
    });
}

function handleSendMessage(e) {
    e.preventDefault();
    const messageText = messageInput.value.trim();
    
    if (messageText) {
        // Message sending logic will be implemented here
        console.log("Sending message:", messageText);
        messageInput.value = "";
    }
}

