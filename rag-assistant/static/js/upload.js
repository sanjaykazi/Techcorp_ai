let uploadedDoc = null;

const messagesEl = document.getElementById('upload-messages');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-button');
const statusEl = document.getElementById('file-status');
const chatInput = document.getElementById('upload-chat-input');
const sendBtn = document.getElementById('upload-send-button');

function addMsg(type, content) {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  const c = document.createElement('div');
  c.className = 'message-content';
  c.innerHTML = content;
  div.appendChild(c);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

uploadBtn.addEventListener('click', async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    statusEl.textContent = 'Select a file first';
    return;
  }
  const file = fileInput.files[0];
  const form = new FormData();
  form.append('file', file);
  uploadBtn.disabled = true;
  statusEl.textContent = 'Uploading and parsing...';
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    uploadedDoc = { text: data.text, metadata: data.metadata };
    statusEl.textContent = `Loaded: ${data.metadata.file} (${Math.round((data.text.length/1024))} KB text)`;
    addMsg('assistant', 'Document uploaded. Ask a question about it.');
  } catch (e) {
    statusEl.textContent = 'Error: ' + e.message;
  } finally {
    uploadBtn.disabled = false;
  }
});

sendBtn.addEventListener('click', send);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }});

async function send() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  if (!uploadedDoc) { addMsg('assistant', 'Please upload a document first.'); return; }
  addMsg('user', msg);
  chatInput.value = '';
  try {
    const res = await fetch('/api/upload/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, text: uploadedDoc.text, metadata: uploadedDoc.metadata })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    addMsg('assistant', data.response);
  } catch (e) {
    addMsg('assistant', 'Error: ' + e.message);
  }
}


