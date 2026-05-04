/**
 * GrowMate — AI field assistant
 *
 * Phase 1: static UI scaffold. Conversation UI is functional but responses
 * are mocked. Phase 2 will wire this to POST /api/growmate/chat.
 *
 * See: docs/designs/REVAMP_SPEC_2026.md §3.6
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Leaf } from 'lucide-react'

interface Message {
  role: 'ai' | 'user'
  text: string
}

const STARTER_MESSAGES: Message[] = [
  {
    role: 'ai',
    text: "Hi! I'm GrowMate, your AI field assistant for the Coorg land.\n\nAsk me about any tree, pest, practice, or seasonal task. I can also pull up recent health observations and carbon estimates when you mention a tree code.",
  },
]

/** Placeholder AI responses until Phase 2 backend is wired */
function mockResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('arb-') || lower.includes('tree')) {
    return "I can see you're asking about a specific tree. Once the GrowMate backend is connected (Phase 2), I'll fetch its full health history, carbon profile, and give you a targeted diagnosis.\n\nFor now, you can open the tree detail page to see its current data."
  }
  if (lower.includes('pest') || lower.includes('disease') || lower.includes('anthracnose')) {
    return "Anthracnose is common on mango in Coorg's pre-monsoon transition. Key steps:\n\n1. Prune affected twigs 15 cm below visible lesions\n2. Apply copper-based fungicide (Bordeaux mixture 1%)\n3. Improve canopy airflow — check adjacent trees for overcrowding\n4. Log a health observation now so I can track progression"
  }
  if (lower.includes('water') || lower.includes('monsoon') || lower.includes('rain')) {
    return "May is the last window before the southwest monsoon arrives in Coorg (typically 1–10 June). Priority tasks this week:\n\n• Complete any pruning — fresh cuts need 2 weeks to callus before rains\n• Check drainage channels in all zones\n• Log pre-monsoon health baselines for high-value trees"
  }
  return "I'm GrowMate in offline / scaffold mode. The AI backend will be connected in Phase 2. For now I can offer general guidance — try asking about pests, monsoon timing, or a specific tree code."
}

export default function GrowMate() {
  const [messages, setMessages] = useState<Message[]>(STARTER_MESSAGES)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function send() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setThinking(true)
    // Mock latency; Phase 2 replaces this with a real fetch
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: mockResponse(text) }])
      setThinking(false)
    }, 900)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-brand-night/8 bg-brand-offwhite">
        <div className="w-9 h-9 rounded-xl bg-brand-forest flex items-center justify-center flex-shrink-0">
          <Leaf size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-brand-night">GrowMate</p>
          <p className="text-[10px] text-brand-forest-mid">AI field assistant · scaffold mode</p>
        </div>
      </div>

      {/* ── Message thread ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
              m.role === 'ai'
                ? 'bg-white border border-brand-night/8 text-brand-night rounded-tl-sm'
                : 'bg-brand-forest text-white rounded-tr-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-brand-night/8 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 pb-6 pt-2 border-t border-brand-night/8 bg-brand-offwhite">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Ask about a tree, pest, or practice…"
            className="flex-1 resize-none bg-white border border-brand-night/10 rounded-2xl px-4 py-2.5 text-[13px] text-brand-night placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-forest/20 leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || thinking}
            aria-label="Send message"
            className="w-10 h-10 bg-brand-forest rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all">
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-brand-muted text-center mt-2">
          Phase 2 will connect to live AI · responses are mocked for now
        </p>
      </div>
    </div>
  )
}
