# Techcorp AI

Welcome to the Techcorp AI project.

## Overview
This project contains AI-related tools and applications developed by Techcorp.

To get started with this project, follow these steps:
1. Clone the repository
2. Install dependencies
3. Run the application

## Features
- AI-powered solutions
- Modern development practices
- Scalable architecture

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.

1. Set Up Development Environment
2. Explore TechCorp's Document Vault
3. Initialize Vector Database
4. Learn Document Chunking Strategy
5. Understand How Embeddings Work
6. Feed the AI Brain
7. Activate Semantic Search Superpowers
8. Complete RAG Pipeline Test
9. Launch Your AI Assistant



Task 1: Set Up Development Environment
Purpose: Install all dependencies required for building RAG
'''cd /root && mkdir -p rag-project && cd rag-project
python3 -m venv venv && source venv/bin/activate
pip install uv && uv pip install chromadb sentence-transformers openai flask
echo "READY" > /root/rag-setup-complete.txt'''

Task 2: Explore TechCorp's Document Vault
 employee-handbook/
   pet-policy.md (CEO's dog!)
   remote-work-policy.md
   benefits-overview.md
 product-specs/
   cloudsync-pro.md ($1M product)
   datavault.md
 meeting-notes/
   q3-planning-meeting.md
   product-launch-review.md
 customer-faqs/
   general-faqs.md

Total: 500GB simulated as focused docs

Purpose: Review all the documents before building RAG system

cd /Users/sanjaykazi/Desktop/Techcorp_ai/techcorp-docs
ls -la
find . -name "*.md" | wc -l
find . -name "*.md" | wc -l > /Users/sanjaykazi/Desktop/Techcorp_ai/doc-count.txt

Task 3: Initialize Vector Database
-ChromaDB Architecture-
Documents → Vectors → Semantic Space
"pet policy" → [0.2,-0.5...]
"remote work" → [0.1,0.8...]
"product" → [0.9,0.3...]
384-dimensional semantic understanding

Purpose: Create AI brain for storing document vectors

Task 4: Learn Document Chunking Strategy
Smart Chunking Strategy

Original Document (2000 chars)
Chunked (500 chars, 100 overlap)
↑ Overlaps preserve context = 40% better accuracy

Purpose: Learn optimal chunking strategy BEFORE processing real documents

Task 5: Understand How Embeddings Work
Semantic Embedding Transformation
"Dogs allowed Fridays" → AI Model → 384D Vector
[0.23, -0.45, 0.67, ..., 0.12]
Semantic Similarity:
"Pets permitted" ↔ "Dogs allowed" = 92%
"Remote work" ↔ "Dogs allowed" = 18%

Purpose: Learn how AI converts text to math BEFORE processing real documents in Task 6

Mind-Blowing Facts:
• Each word becomes 384 numbers
• Similar meanings = similar vectors
• This is how ChatGPT understands language!

Task 6: Feed the AI Brain
Knowledge Ingestion Pipeline
📄
Documents
pet-policy.md
→
✂️
Chunking
500 chars
→
🧮
Embedding
[0.2,-0.5,...]
→
💾
ChromaDB
Vector Store

Purpose: Process ALL documents using chunking (Task 4) and embeddings (Task 5) into database (Task 3)

Task 7: Activate Semantic Search Superpowers

"Can I bring my dog to work?"
↓
Vector Encoding → [0.23, -0.45, 0.67, ...]
↓
Searching 384D Space...
Top Results (by meaning, not keywords!):
1. pet-policy.md (95% match)
"Dogs allowed on Fridays..."
2. employee-handbook.md (67% match)
"Office policies include..."
3. benefits.md (23% match)
"Health benefits for..."
Search time: 0.003 seconds

Task 8: Complete RAG Pipeline Test

Complete RAG Pipeline Flow
1. RETRIEVAL
"Benefits?"
→
[0.3,-0.2,...]
→
Top 3 Docs
2. AUGMENTATION
Context + Question
→
Prompt Engineering
"Based on: [docs]... Answer: [question]"
3. GENERATION
LLM + Context
→
Accurate Answer
"TechCorp offers healthcare, 401k..."
Total Time: < 1 second | Accuracy: 100%

Purpose: Test all three phases of your RAG pipeline working together

Task 9: Launch Your AI Assistant
Purpose: Deploy and interact with your complete RAG system via web interface

cd /root/rag-assistant
python app.py

This starts the Flask server on port 5252. How to access the interface?
⏱️ Wait 2 minutes for vector database initialization before testing

Step 2: See It In Action
User types:
"Are Pets allowed to Office?"
RETRIEVE
Search DB
→
AUGMENT
Add Context
→
GENERATE
DeepSeek AI
● Finds: pet-policy.md (95%)
● Query + Docs
● Natural Response
AI responds:
"Yes! Dogs are allowed on Fridays..." [pet-policy.md]

cd /root/rag-assistant
python app.py

