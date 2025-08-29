# TechCorp AI - Technical Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Web Interface\nHTML/CSS/JavaScript]
        SSE[Server-Sent Events\nReal-time Streaming]
    end

    subgraph "API Layer"
        Flask[Flask Web Server\nPort 5252]
        ChatAPI[/api/chat\nStandard Chat/]
        StreamAPI[/api/chat/stream\nStreaming Chat/]
        StatusAPI[/api/status\nSystem Health/]
    end

    subgraph "RAG Pipeline"
        ChatEngine[Chat Engine\nRAG Orchestrator]
        Retrieval[Document Retrieval\nVector Search]
        Augmentation[Context Augmentation\nQuery + Documents]
        Generation[LLM Generation\nDeepSeek/OpenAI]
    end

    subgraph "Vector Database"
        ChromaDB[ChromaDB\nVector Store]
        Embeddings[384D Embeddings\nall-MiniLM-L6-v2]
        Collections[Document Collections\nCosine Similarity]
    end

    subgraph "Document Processing"
        DocProcessor[Document Processor\nChunking Engine]
        Chunking[Smart Chunking\n500 chars + 100 overlap]
        Metadata[Metadata Extraction\nTitle, Category, File]
    end

    subgraph "Knowledge Base"
        EmployeeDocs[Employee Handbook\nPolicies & Benefits]
        ProductDocs[Product Specs\nCloudSync Pro, DataVault]
        MeetingDocs[Meeting Notes\nQ3 Planning, Launch Review]
        CustomerDocs[Customer FAQs\nGeneral Support]
    end

    UI --> Flask
    SSE --> Flask
    Flask --> ChatAPI
    Flask --> StreamAPI
    Flask --> StatusAPI
    
    ChatAPI --> ChatEngine
    StreamAPI --> ChatEngine
    StatusAPI --> ChromaDB
    
    ChatEngine --> Retrieval
    Retrieval --> ChromaDB
    ChromaDB --> Embeddings
    ChromaDB --> Collections
    
    ChatEngine --> Augmentation
    Augmentation --> Generation
    
    DocProcessor --> Chunking
    Chunking --> Metadata
    DocProcessor --> ChromaDB
    
    EmployeeDocs --> DocProcessor
    ProductDocs --> DocProcessor
    MeetingDocs --> DocProcessor
    CustomerDocs --> DocProcessor
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Flask
    participant ChatEngine
    participant VectorEngine
    participant ChromaDB
    participant LLM

    User->>UI: Type Question
    UI->>Flask: POST /api/chat/stream
    Flask->>ChatEngine: Process Query
    
    ChatEngine->>VectorEngine: Search Documents
    VectorEngine->>ChromaDB: Query Vector DB
    ChromaDB-->>VectorEngine: Return Top Results
    VectorEngine-->>ChatEngine: Relevant Documents
    
    ChatEngine->>ChatEngine: Augment Context
    ChatEngine->>LLM: Generate Response
    LLM-->>ChatEngine: AI Response
    
    ChatEngine-->>Flask: Response + Sources
    Flask-->>UI: Stream Response
    UI-->>User: Display Answer
```

## Component Interaction Details

### 1. Document Ingestion Flow
```
Document Files (.md) → Document Processor → Chunking → Embeddings → ChromaDB
     ↓                    ↓                ↓           ↓           ↓
  Markdown Text    Smart Segmentation  500-char   384D Vector   Persistent
  Content         with 100-char       Chunks     Arrays       Storage
                  Overlap
```

### 2. Query Processing Flow
```
User Question → Vector Encoding → Semantic Search → Top 5 Results → Context Augmentation → LLM Generation → Response
     ↓              ↓              ↓              ↓              ↓              ↓              ↓
  Natural Text   384D Vector   Cosine Distance  Relevant Docs  Enhanced      AI Model      Formatted
  Query         Embedding     Similarity       with Metadata  Prompt        Output        Answer
```

### 3. Response Generation Flow
```
Retrieved Documents → Context Builder → Augmented Prompt → LLM API → Response Parser → Source Attribution → Final Output
         ↓              ↓              ↓              ↓           ↓              ↓              ↓
    Top 5 Results   Document Text   Query + Docs   API Call    Raw Text     Source Links   User Display
    with Scores     + Metadata      + Instructions  Response    Processing   + Confidence   + Sources
```

## Performance Characteristics

### Response Time Breakdown
```
Total Response Time: < 1 second
├── Document Retrieval: ~50ms
├── Context Augmentation: ~10ms
├── LLM API Call: ~200-800ms
├── Response Processing: ~10ms
└── Network Latency: ~50-100ms
```

### Memory Usage
```
System Memory Requirements:
├── Embedding Model: ~90MB
├── ChromaDB Index: ~50-200MB (depends on docs)
├── Flask Application: ~50MB
├── Document Cache: ~10-50MB
└── Total: ~200-400MB typical
```

### Scalability Metrics
```
Document Processing Capacity:
├── Chunk Size: 500 characters
├── Overlap: 100 characters
├── Embedding Dimensions: 384
├── Max Documents: 10,000+ (theoretical)
├── Max Chunks: 100,000+ (theoretical)
└── Search Performance: O(log n) complexity
```

## Security & Privacy Architecture

```mermaid
graph LR
    subgraph "Security Layers"
        Network[Network Security<br/>Localhost Only]
        Auth[API Key Management<br/>Environment Variables]
        Data[Data Privacy<br/>Local Storage Only]
        Access[Access Control<br/>File Permissions]
    end
    
    subgraph "Privacy Features"
        Local[Local Processing<br/>No External Data]
        Encryption[Vector Encryption<br/>ChromaDB Security]
        Audit[Audit Trail<br/>Query Logging]
        Isolation[Process Isolation<br/>Virtual Environment]
    end
    
    Network --> Auth
    Auth --> Data
    Data --> Access
    Local --> Encryption
    Encryption --> Audit
    Audit --> Isolation
```

## Error Handling & Resilience

### Fallback Mechanisms
```
Primary Path: User Query → RAG Pipeline → LLM Response
     ↓
Fallback 1: LLM Unavailable → Context-Based Response
     ↓
Fallback 2: No Context → Generic Response
     ↓
Fallback 3: System Error → User-Friendly Error Message
```

### Error Recovery
```
Error Types & Recovery:
├── API Key Issues: Environment variable validation
├── Model Loading: Offline mode fallback
├── Network Errors: Retry with exponential backoff
├── Memory Issues: Garbage collection and cleanup
└── Database Errors: Connection retry and validation
```

## Monitoring & Observability

### Health Check Endpoints
```
/api/status Response:
{
  "status": "operational",
  "documents": 8,
  "chunks": 45,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### Performance Metrics
```
Key Performance Indicators:
├── Response Time: Average < 1s
├── Document Count: Real-time tracking
├── Chunk Count: Vector store size
├── API Success Rate: > 99%
└── System Uptime: Continuous monitoring
```

---

*This architecture diagram provides a comprehensive view of the TechCorp AI system's technical implementation and data flow patterns.*

