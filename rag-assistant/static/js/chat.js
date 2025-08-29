// TechCorp AI Assistant - Simple Chat Interface

// Global variables
let isStreaming = false;

// Initialize chat
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    // Check status on load
    checkStatus();

    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send message on Enter (Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isStreaming) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Show loading state
        setLoadingState(true);

        // Try streaming first, fallback to normal
        sendMessageStream(message)
            .catch(() => sendMessageNormal(message))
            .finally(() => setLoadingState(false));
    }

    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setLoadingState(loading) {
        isStreaming = loading;
        sendButton.disabled = loading;
        const sendText = document.getElementById('send-text');
        const sendLoading = document.getElementById('send-loading');
        
        if (loading) {
            sendText.style.display = 'none';
            sendLoading.style.display = 'inline-block';
        } else {
            sendText.style.display = 'inline';
            sendLoading.style.display = 'none';
        }
    }

    async function sendMessageStream(message) {
        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error('Stream request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let messageDiv = null;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                if (!messageDiv) {
                                    messageDiv = document.createElement('div');
                                    messageDiv.className = 'message assistant';
                                    
                                    const avatar = document.createElement('div');
                                    avatar.className = 'message-avatar';
                                    avatar.textContent = '🤖';
                                    
                                    const messageContent = document.createElement('div');
                                    messageContent.className = 'message-content';
                                    
                                    messageDiv.appendChild(avatar);
                                    messageDiv.appendChild(messageContent);
                                    chatMessages.appendChild(messageDiv);
                                }

                                assistantMessage += parsed.content;
                                messageDiv.querySelector('.message-content').textContent = assistantMessage;
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            console.error('Error parsing stream data:', e);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    async function sendMessageNormal(message) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Chat request failed');
            }

            const data = await response.json();
            addMessage(data.response, 'assistant');
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    async function checkStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (data.status === 'ready') {
                statusDot.className = 'status-indicator';
                statusText.textContent = 'Ready';
            } else {
                statusDot.className = 'status-indicator error';
                statusText.textContent = 'Error';
            }
        } catch (error) {
            statusDot.className = 'status-indicator error';
            statusText.textContent = 'Offline';
        }
    }
});
