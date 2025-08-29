#!/usr/bin/env python3
"""
TechCorp AI Assistant - Interactive RAG Chat Interface
"""

from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import os
import sys
from datetime import datetime
from werkzeug.utils import secure_filename
import json
import time

# Add core modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'core'))

from core.vector_engine import VectorEngine
from core.chat_engine import ChatEngine
from core.document_processor import DocumentProcessor

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25MB
app.config['UPLOAD_EXTENSIONS'] = {'.md', '.txt', '.pdf', '.docx', '.pptx'}

# Initialize RAG components
print("\n" + "="*60)
print("🚀 Starting TechCorp AI Assistant")
print("="*60)
print("\n[INIT] Loading RAG components...")

vector_engine = VectorEngine()
print("[INIT] Vector engine ready")

chat_engine = ChatEngine(vector_engine)
print("[INIT] Chat engine ready")

docs_path_override = os.environ.get('TECHCORP_DOCS_PATH')
if docs_path_override:
    print(f"[INIT] Using docs path from TECHCORP_DOCS_PATH: {docs_path_override}")
doc_processor = DocumentProcessor(vector_engine, docs_path=docs_path_override)
print("[INIT] Document processor ready")

@app.route('/')
def home():
    """Render the home interface"""
    return render_template('home.html')

@app.route('/chat')
def chat_page():
    """Render the chat interface"""
    return render_template('chat.html')

@app.route('/upload')
def upload_page():
    """Render the upload-based QA interface"""
    return render_template('upload.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Get response from RAG system
        response = chat_engine.get_response(user_message)
        
        return jsonify({
            'response': response['answer'],
            'sources': response['sources'],
            'confidence': response['confidence'],
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Accept a single file upload and return parsed text + basic metadata."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        filename = secure_filename(file.filename)
        ext = os.path.splitext(filename)[1].lower()
        if ext not in app.config['UPLOAD_EXTENSIONS']:
            return jsonify({'error': f'Unsupported file type: {ext}'}), 400

        # Save to tmp and parse using DocumentProcessor's readers
        tmp_dir = os.path.join(os.path.dirname(__file__), 'tmp_uploads')
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_path = os.path.join(tmp_dir, filename)
        file.save(tmp_path)

        # Use DocumentProcessor reading method
        from core.document_processor import DocumentProcessor
        temp_processor = DocumentProcessor(vector_engine)
        from pathlib import Path
        text = temp_processor._read_file_to_text(Path(tmp_path))

        # Cleanup tmp file
        try:
            os.remove(tmp_path)
        except Exception:
            pass

        meta = {
            'title': os.path.splitext(filename)[0],
            'file': filename,
            'size_bytes': len(text.encode('utf-8')),
        }
        return jsonify({'text': text, 'metadata': meta})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/chat', methods=['POST'])
def upload_chat():
    """Answer questions based on the uploaded document text sent by the client."""
    try:
        data = request.json or {}
        user_message = data.get('message', '').strip()
        doc_text = data.get('document_text', '')  # Fixed: frontend sends 'document_text'
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        if not doc_text:
            return jsonify({'error': 'No document text provided'}), 400

        # Create a pseudo-document list for ChatEngine
        pseudo_docs = [{
            'id': 'uploaded_0',
            'text': doc_text,
            'metadata': {
                'title': 'Uploaded Document',
                'category': 'uploaded',
                'file': 'upload',
            },
            'score': 0.9
        }]

        result = chat_engine.get_response_from_docs(user_message, pseudo_docs)
        return jsonify({
            'response': result['answer'],
            'sources': result['sources'],
            'confidence': result['confidence'],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    """Handle chat messages with streaming response"""
    def generate():
        try:
            data = request.json
            user_message = data.get('message', '')
            
            if not user_message:
                yield f"data: {json.dumps({'error': 'No message provided'})}\n\n"
                return
            
            # Send initial event
            yield f"data: {json.dumps({'event': 'start'})}\n\n"
            
            # Get response from RAG system
            response = chat_engine.get_response(user_message)
            
            # Stream the response word by word
            words = response['answer'].split()
            for i, word in enumerate(words):
                time.sleep(0.05)  # Small delay for streaming effect
                yield f"data: {json.dumps({'event': 'token', 'content': word + ' '})}\n\n"
            
            # Send sources at the end
            yield f"data: {json.dumps({'event': 'sources', 'sources': response['sources'], 'confidence': response['confidence']})}\n\n"
            
            # Send completion event
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'error': str(e)})}\n\n"
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route('/api/status', methods=['GET'])
def status():
    """Get system status"""
    try:
        stats = vector_engine.get_stats()
        return jsonify({
            'status': 'operational',
            'documents': stats['total_documents'],
            'chunks': stats['total_chunks'],
            'last_updated': stats['last_updated']
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    # Initialize database with documents on first run
    if not vector_engine.is_initialized():
        print("First run detected. Processing TechCorp documents...")
        doc_processor.process_all_documents()
        print("Document processing complete!")
    
    # Run the app
    app.run(host='0.0.0.0', port=5252, debug=True)
