import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import api from '../../services/api'

const WELCOME = { role: 'assistant', content: 'Hi! I\'m SkillBot 🤖 — your SkillSwap assistant. Ask me anything about credits, sessions, hosting, or subscriptions!' }

export default function AIChatBubble() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [unread, setUnread]     = useState(0)
  const bottomRef = useRef()
  const inputRef  = useRef()

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (!open && messages.length > 1) setUnread((u) => u + 1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    try {
      const history = messages.slice(-10).map(({ role, content }) => ({ role, content }))
      const res = await api.post('/chat', { message: text, history })
      setMessages((m) => [...m, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[340px] h-[480px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(12, 14, 28, 0.97)',
              border: '1px solid rgba(255,153,51,0.18)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(204,82,0,0.9), rgba(255,140,0,0.8))' }}>
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-white" />
                <span className="text-white font-bold text-sm">SkillBot</span>
                <span className="text-[10px] text-white/70 bg-white/15 px-1.5 py-0.5 rounded-full">AI</span>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #CC6A00, #FF9933)' }}>
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, rgba(204,82,0,0.85), rgba(255,140,0,0.75))',
                      color: 'white',
                      borderRadius: '16px 4px 16px 16px',
                    } : {
                      background: 'rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.88)',
                      borderRadius: '4px 16px 16px 16px',
                    }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #CC6A00, #FF9933)' }}>
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '4px 16px 16px 16px' }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#FF9933' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 flex gap-2 p-3 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask me anything…"
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
                style={{ background: 'linear-gradient(135deg, #CC6A00, #FF9933)' }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl relative"
        style={{ background: 'linear-gradient(135deg, #CC6A00, #FF9933)', boxShadow: '0 4px 24px rgba(255,153,51,0.45)' }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} className="text-white" />
              </motion.div>
            : <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle size={22} className="text-white" />
              </motion.div>
          }
        </AnimatePresence>
        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: '#3949AB' }}>
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}
