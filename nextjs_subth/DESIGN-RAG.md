# RAG (Retrieval-Augmented Generation) Design

> รายละเอียดการเพิ่ม LLM ให้ Semantic Search คุยได้เหมือน ChatGPT

## Overview

แทนที่จะแค่ค้นหาแล้วแสดงผล ระบบจะมี "บุคลิก" และตอบกลับแบบกวนๆ

**ตัวอย่าง:**
```
User: "ขอแบบสาวผมทอง ใส่แว่นหน่อย"

AI: "จัดไปสิพ่อหนุ่ม! คัดมาเน้นๆ สาวผมทองใส่แว่น ตามนี้เลย..."
    [แสดง Video Grid]
```

## Tech Stack เพิ่มเติม

| Component | Options | Purpose |
|-----------|---------|---------|
| LLM Engine | Ollama (Llama 3 / Mistral) หรือ Groq API | สมองที่เอาไว้คุย |
| Framework | LangChain หรือ LlamaIndex | เชื่อม LLM กับ Vector DB |
| Thai LLM | Typhoon (SCB 10X) | รองรับภาษาไทยดี |
| Vector DB | pgvector (มีอยู่แล้ว) | เก็บ CLIP Embeddings |

### Self-Hosted Options (ไม่ต้องพึ่ง OpenAI)
- **Ollama**: รันบน Server เอง (แนะนำ Llama 3 8B หรือ Typhoon)
- **vLLM**: ถ้ามี GPU แรง inference เร็วมาก

## RAG Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAG Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User Input                                                  │
│     "ขอแบบสาวผมทอง ใส่แว่นหน่อย"                                 │
│              │                                                  │
│              ▼                                                  │
│  2. LLM Intent Analysis                                         │
│     ┌─────────────────────────────────────┐                    │
│     │ System Prompt:                      │                    │
│     │ "คุณคือผู้ช่วยสุดกวน สกัด Keyword   │                    │
│     │  และตอบด้วย 'จัดไปสิพ่อหนุ่ม'"      │                    │
│     └─────────────────────────────────────┘                    │
│              │                                                  │
│              ▼                                                  │
│  3. Keyword Extraction                                          │
│     LLM สกัด: ["blonde hair", "glasses"]                       │
│              │                                                  │
│              ▼                                                  │
│  4. Vector Search (CLIP)                                        │
│     Keywords → Embedding → Search pgvector                      │
│              │                                                  │
│              ▼                                                  │
│  5. Response Construction                                       │
│     LLM สร้างคำตอบ + รายชื่อหนัง 5 เรื่อง                        │
│              │                                                  │
│              ▼                                                  │
│  6. Final Output                                                │
│     "จัดไปสิพ่อหนุ่ม! คัดมาเน้นๆ..." + Video Grid              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Implementation (GoFiber)

### New Endpoint
```
POST /api/v1/chat/semantic
```

### Response Structure
```go
// domain/dto/chat_response.go
type ChatSemanticResponse struct {
    Message string         `json:"message"` // "จัดไปสิพ่อหนุ่ม! ..."
    Videos  []VideoSummary `json:"videos"`  // ผลลัพธ์จาก Vector DB
}

type VideoSummary struct {
    ID        string  `json:"id"`
    Code      string  `json:"code"`
    Title     string  `json:"title"`
    Thumbnail string  `json:"thumbnail"`
    Score     float64 `json:"score"`  // similarity score
}
```

### System Prompt (Few-shot)
```go
const SystemPrompt = `คุณคือผู้ช่วยแนะนำหนังสุดกวนชื่อ "น้องเอไอ"
หน้าที่ของคุณคือ:
1. สกัด Keyword จากคำขอของ user
2. ตอบกลับด้วยน้ำเสียงสนุกสนาน เป็นกันเอง

ตัวอย่างการตอบ:
- "จัดไปสิพ่อหนุ่ม! คัดมาเน้นๆ ตามนี้เลย..."
- "โอ้โห รสนิยมดีจัด! มีมาให้เลือกนะ..."
- "ว้าว ชอบแบบนี้เหรอ จัดให้เต็มที่!"

กฎ:
- ตอบเป็นภาษาไทยเท่านั้น
- ห้ามพูดหยาบคาย
- ถ้าหาไม่เจอให้บอกว่า "หาไม่เจอเลยพ่อหนุ่ม ลองใหม่อีกทีนะ"
`
```

### Service Layer
```go
// application/serviceimpl/chat_service.go
type ChatService struct {
    llm        LLMClient      // Ollama / Groq
    clipSearch ClipSearcher   // existing CLIP service
}

func (s *ChatService) SemanticChat(ctx context.Context, userMessage string) (*dto.ChatSemanticResponse, error) {
    // 1. Extract keywords via LLM
    keywords, err := s.llm.ExtractKeywords(ctx, userMessage)
    if err != nil {
        return nil, err
    }

    // 2. Search videos via CLIP
    videos, err := s.clipSearch.SearchByKeywords(ctx, keywords, 10)
    if err != nil {
        return nil, err
    }

    // 3. Generate response via LLM
    message, err := s.llm.GenerateResponse(ctx, userMessage, videos)
    if err != nil {
        return nil, err
    }

    return &dto.ChatSemanticResponse{
        Message: message,
        Videos:  videos,
    }, nil
}
```

## Frontend Implementation (Next.js)

### Feature Structure
```
features/semantic-search/
├── types.ts
│   └── ChatResponse, ChatMessage
├── service.ts
│   └── chatSemantic(query): Promise<ChatResponse>
├── hooks.ts
│   └── useChatSemantic() - mutation with streaming
├── store.ts
│   └── messages[], isTyping
└── components/
    ├── chat-bubble.tsx      # แสดงข้อความ AI
    ├── typing-indicator.tsx # "กำลังพิมพ์..."
    ├── search-modal.tsx     # อัพเดทให้มี chat
    └── index.ts
```

### Types
```tsx
// features/semantic-search/types.ts
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  videos?: VideoSummary[]
  timestamp: Date
}

export interface ChatResponse {
  message: string
  videos: VideoSummary[]
}
```

### Chat Bubble Component
```tsx
// features/semantic-search/components/chat-bubble.tsx
"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  message: string
  isAI?: boolean
  isTyping?: boolean
}

export function ChatBubble({ message, isAI, isTyping }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2",
        isAI
          ? "bg-primary text-primary-foreground self-start"
          : "bg-muted self-end"
      )}
    >
      {isTyping ? (
        <TypingIndicator />
      ) : (
        <p className="text-sm">{message}</p>
      )}
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="h-2 w-2 rounded-full bg-current"
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
        className="h-2 w-2 rounded-full bg-current"
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
        className="h-2 w-2 rounded-full bg-current"
      />
    </div>
  )
}
```

### Streaming Text Effect
```tsx
// features/semantic-search/hooks.ts
import { useState, useEffect } from 'react'

export function useStreamingText(text: string, speed = 30) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return

    let index = 0
    setDisplayedText('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayedText, isComplete }
}
```

### Updated Modal Layout
```tsx
// features/semantic-search/components/search-modal.tsx
export function SearchModal() {
  const { messages, isTyping } = useSemanticSearchStore()
  const { displayedText } = useStreamingText(latestMessage)

  return (
    <Dialog>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isAI={msg.role === 'assistant'}
            />
          ))}
          {isTyping && <ChatBubble message="" isAI isTyping />}
        </div>

        {/* Video Results */}
        {latestVideos.length > 0 && (
          <div className="border-t p-4">
            <VideoGrid videos={latestVideos} compact />
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <SearchInput onSubmit={handleSearch} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Store (Zustand)
```tsx
// features/semantic-search/store.ts
import { create } from 'zustand'
import type { ChatMessage, VideoSummary } from './types'

interface SemanticSearchStore {
  isOpen: boolean
  messages: ChatMessage[]
  latestVideos: VideoSummary[]
  isTyping: boolean

  open: () => void
  close: () => void
  addMessage: (msg: ChatMessage) => void
  setVideos: (videos: VideoSummary[]) => void
  setTyping: (typing: boolean) => void
  clearChat: () => void
}

export const useSemanticSearchStore = create<SemanticSearchStore>((set) => ({
  isOpen: false,
  messages: [],
  latestVideos: [],
  isTyping: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),
  setVideos: (videos) => set({ latestVideos: videos }),
  setTyping: (typing) => set({ isTyping: typing }),
  clearChat: () => set({ messages: [], latestVideos: [] }),
}))
```

## Implementation Plan

### Phase 5.1: Backend RAG (รอ Translation เสร็จ)
- [ ] Setup Ollama + Llama 3 (หรือ Typhoon)
- [ ] สร้าง LLM client service
- [ ] สร้าง `POST /api/v1/chat/semantic` endpoint
- [ ] ทำ System Prompt + Few-shot examples
- [ ] เชื่อม LLM กับ existing CLIP search

### Phase 5.2: Frontend Chat UI
- [ ] `chat-bubble.tsx` - แสดงข้อความ
- [ ] `typing-indicator.tsx` - animation กำลังพิมพ์
- [ ] `useStreamingText` hook - typing effect
- [ ] อัพเดท `search-modal.tsx` ให้เป็น chat layout
- [ ] อัพเดท Zustand store เก็บ messages

### Phase 5.3: Polish
- [ ] Streaming response (SSE) จาก backend
- [ ] Error handling (LLM timeout, etc.)
- [ ] Rate limiting
- [ ] Analytics (track queries)

## Hardware Requirements

| Setup | RAM | GPU | Model |
|-------|-----|-----|-------|
| Minimum | 16GB | - | Llama 3 8B (Q4) |
| Recommended | 32GB | RTX 3060+ | Llama 3 8B (FP16) |
| Production | 64GB | RTX 4090 | Typhoon 70B |

## Cost Comparison

| Option | Cost | Latency | Privacy |
|--------|------|---------|---------|
| OpenAI GPT-4 | ~$0.03/query | 1-2s | Low |
| Groq (Llama 3) | ~$0.001/query | 0.3s | Medium |
| Self-hosted Ollama | Server cost only | 1-3s | High |

## Notes

- **Few-shot Prompting**: ใส่ตัวอย่างบทสนทนา 3-4 อันใน prompt ทำให้ LLM เข้าใจ "โทน" ได้ทันทีโดยไม่ต้อง train ใหม่
- **Typhoon**: LLM ภาษาไทยจาก SCB 10X เข้าใจภาษาไทยดีกว่า Llama
- **Streaming**: ใช้ SSE (Server-Sent Events) ทำให้ UX ดูเหมือน ChatGPT
