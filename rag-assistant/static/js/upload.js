document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const fileUploadArea = document.getElementById('file-upload-area');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    const documentChat = document.getElementById('document-chat');
    const documentChatMessages = document.getElementById('document-chat-messages');
    const documentChatInput = document.getElementById('document-chat-input');
    const documentSendButton = document.getElementById('document-send-button');
    
    let uploadedDocumentText = '';
    let isProcessing = false;

    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleDrop);
    
    // Upload button handler
    uploadBtn.addEventListener('click', function() {
        if (!fileInput.files || fileInput.files.length === 0) {
            // If no file selected, open file picker
            fileInput.click();
        } else {
            // If file already selected, upload it
            handleUpload();
        }
    });
    
    // Chat input handlers
    documentChatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendDocumentMessage();
        }
    });
    
    documentSendButton.addEventListener('click', sendDocumentMessage);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            updateFileInfo(file);
            uploadBtn.disabled = false;
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        fileUploadArea.classList.add('dragover');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        fileUploadArea.classList.remove('dragover');
    }

    function handleDrop(event) {
        event.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            updateFileInfo(files[0]);
            uploadBtn.disabled = false;
        }
    }

    function updateFileInfo(file) {
        const fileText = fileUploadArea.querySelector('.file-upload-text');
        const fileHint = fileUploadArea.querySelector('.file-upload-hint');
        
        fileText.textContent = `Selected: ${file.name}`;
        fileHint.textContent = `Size: ${(file.size / 1024).toFixed(1)} KB | Type: ${file.type || 'Unknown'}`;
        
        // Update button text
        uploadBtn.textContent = 'Upload Document';
    }

    async function handleUpload() {
        const file = fileInput.files[0];
        if (!file) return;

        isProcessing = true;
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Processing...';
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                uploadedDocumentText = data.text;
                showUploadStatus('Document uploaded successfully! You can now ask questions about it.', 'success');
                showDocumentChat();
            } else {
                showUploadStatus(`Upload failed: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showUploadStatus('Upload failed: Network error', 'error');
        } finally {
            isProcessing = false;
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Document';
        }
    }

    function showUploadStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `upload-status ${type}`;
        uploadStatus.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                uploadStatus.style.display = 'none';
            }, 5000);
        }
    }

    function showDocumentChat() {
        documentChat.style.display = 'block';
        documentChat.scrollIntoView({ behavior: 'smooth' });
    }

    function sendDocumentMessage() {
        const message = documentChatInput.value.trim();
        if (!message || isProcessing) return;

        // Add user message
        addDocumentMessage(message, 'user');
        documentChatInput.value = '';

        // Show loading state
        setDocumentLoadingState(true);

        // Send to API
        fetch('/api/upload/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                document_text: uploadedDocumentText
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                addDocumentMessage(data.response, 'assistant');
            } else {
                addDocumentMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            }
        })
        .catch(error => {
            console.error('Chat error:', error);
            addDocumentMessage('Sorry, I couldn\'t process your request. Please try again.', 'assistant');
        })
        .finally(() => {
            setDocumentLoadingState(false);
        });
    }

    function addDocumentMessage(content, sender) {
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
        
        documentChatMessages.appendChild(messageDiv);
        documentChatMessages.scrollTop = documentChatMessages.scrollHeight;
    }

    function setDocumentLoadingState(loading) {
        isProcessing = loading;
        documentSendButton.disabled = loading;
        const sendText = document.getElementById('document-send-text');
        const sendLoading = document.getElementById('document-send-loading');
        
        if (loading) {
            sendText.style.display = 'none';
            sendLoading.style.display = 'inline-block';
        } else {
            sendText.style.display = 'inline';
            sendLoading.style.display = 'none';
        }
    }

    // Reset file selection when page loads
    function resetFileSelection() {
        fileInput.value = '';
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Select Document';
        const fileText = fileUploadArea.querySelector('.file-upload-text');
        const fileHint = fileUploadArea.querySelector('.file-upload-hint');
        
        fileText.textContent = 'Drop your document here or click the button below to browse';
        fileHint.textContent = 'Supports: PDF, DOCX, PPTX, TXT, MD';
    }

    // Initialize
    resetFileSelection();
});


