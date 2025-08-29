# TechCorp AI - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

This guide will help you get the TechCorp AI assistant running on your machine quickly.

## Prerequisites

- **Python 3.8+** (recommended: 3.13)
- **pip** package manager
- **OpenAI API key** (or DeepSeek API access)

## ⚡ Quick Setup

### Option A: One-command start (recommended)
```bash
git clone https://github.com/sanjaykazi/Techcorp_ai.git
cd Techcorp_ai
./run.sh
```

Use a different docs folder:
```bash
./run.sh --docs ./external-docs
# or
TECHCORP_DOCS_PATH=/abs/path/to/docs ./run.sh
```

### Option B: Manual setup
#### Step 1: Clone and Navigate
```bash
git clone https://github.com/sanjaykazi/Techcorp_ai.git
cd Techcorp_ai
```

#### Step 2: Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 3: Install Dependencies
```bash
pip install -r rag-project/requirements.txt
```

#### Step 4: Set API Key
```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### Step 5: Launch the App
```bash
cd rag-assistant
python app.py
```

🎉 **You're done!** Open your browser and go to `http://localhost:5252`

## 🔧 What Happens During First Run

1. **Vector Database Initialization**: ChromaDB sets up local storage
2. **Document Processing**: All TechCorp documents are automatically chunked and embedded
3. **Model Loading**: The AI embedding model downloads (~90MB, first time only)
4. **Server Start**: Flask server launches on port 5252

⏱️ **First run takes 2-3 minutes** due to document processing and model download.

## 🧪 Test Your Installation

### Try These Questions:
- "What is TechCorp's pet policy?"
- "Can I bring my dog to work?"
- "What benefits does TechCorp offer?"
- "Tell me about CloudSync Pro"

### Expected Response Format:
- **Answer**: AI-generated response
- **Sources**: Document references with relevance scores
- **Confidence**: Overall reliability metric

## 🚨 Troubleshooting

### Common Issues & Solutions

**1. "OPENAI_API_KEY not set"**
```bash
export OPENAI_API_KEY="your-key-here"
```

**2. "Port already in use"**
```bash
# Kill process on port 5252
lsof -ti:5252 | xargs kill -9
# Or change port in app.py
```

**3. "Model download failed"**
```bash
# Check internet connection
# Or use offline mode (limited functionality)
```

**4. "Permission denied"**
```bash
# Check file permissions
chmod +r techcorp-docs/**/*.md
```

## 📱 Using the Interface

### Chat Features:
- **Real-time streaming**: Responses appear word by word
- **Source attribution**: See which documents were used
- **Confidence scores**: Know how reliable the answer is
- **Responsive design**: Works on desktop and mobile

### Navigation:
- **Type questions** in the input field
- **Press Enter** or click send button
- **View sources** below each response
- **Check status** in the header

## 🔄 Adding New Documents

1. **Place files** in appropriate `techcorp-docs/` subdirectories (or in the folder set via `TECHCORP_DOCS_PATH`)
2. **Restart the app** to auto-process new documents
3. **Documents are automatically** chunked and vectorized

### Supported Formats:
- **Markdown (.md)**
- **Text (.txt)**
- **PDF (.pdf)** — requires `pypdf`
- **Word (.docx)** — requires `python-docx`
- **PowerPoint (.pptx)** — requires `python-pptx`

## 📊 System Status

### Health Check:
```bash
curl http://localhost:5252/api/status
```

### Expected Response:
```json
{
  "status": "operational",
  "documents": 8,
  "chunks": 45,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

## ⚙️ Configuring the documents folder

You can point the app to any folder of markdown documents using an environment variable or script argument:

- Environment variable:
```bash
export TECHCORP_DOCS_PATH=/path/to/your-docs


```

- Script argument:
```bash
./run.sh --docs ./external-docs
```

If unset, the app defaults to `techcorp-docs/` in the repo root.

## 🎯 Next Steps

### For Users:
- **Explore the knowledge base** with different questions
- **Test edge cases** to understand AI capabilities
- **Provide feedback** on response quality

### For Developers:
- **Customize the system prompt** in `chat_engine.py`
- **Adjust chunking parameters** in `document_processor.py`
- **Add new API endpoints** in `app.py`
- **Modify the UI** in `static/` directory

## 📚 Learn More

- **Full Documentation**: See `PROJECT_DOCUMENTATION.md`
- **Architecture Details**: See `ARCHITECTURE_DIAGRAM.md`
- **Code Examples**: Explore the `core/` directory
- **Testing**: Check `rag-project/` for test files

## 🆘 Need Help?

### Check These First:
1. **Python version**: `python3 --version`
2. **Dependencies**: `pip list | grep -E "(flask|chromadb|sentence-transformers)"`
3. **API key**: `echo $OPENAI_API_KEY`
4. **Port status**: `lsof -i:5252`

### Still Stuck?
- Check the console output for error messages
- Verify all prerequisites are met
- Ensure proper file permissions
- Try restarting the application

---

**Happy AI Chatting! 🤖✨**

*This quick start guide gets you from zero to AI assistant in under 5 minutes.*
