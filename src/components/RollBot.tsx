'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageCircle, X, Send, Bot, Sparkles, ShoppingBag,
  ExternalLink, RotateCcw, ChevronRight, Phone, Tag, Clock
} from 'lucide-react'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  actionType?: string
  orderCode?: string
}

export function RollBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Namaste! I'm **RollBot**, your personal Kathi roll concierge. How can I delight your tastebuds today?",
      timestamp: 'Just now',
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      })
      const json = await res.json()

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: json.reply || "I'm having a little trouble connecting to the kitchen. Please try again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: json.actionType,
        orderCode: json.orderCode,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: "I couldn't reach the server. Please check your connection or contact our kitchen desk.",
          timestamp: 'Just now',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "👋 Chat reset! I'm **RollBot**. How can I help you with your cravings?",
        timestamp: 'Just now',
      },
    ])
  }

  const renderFormattedText = (text: string) => {
    // Quick simple markdown link & bold parser
    const lines = text.split('\n')
    return lines.map((line, i) => {
      let parsed = line

      // Parse bold **text**
      const parts = parsed.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={i} className="min-h-[1.2em]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-[#22092C]">{part.slice(2, -2)}</strong>
            }
            // Parse [text](url)
            const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
            if (linkMatch) {
              return (
                <Link
                  key={pIdx}
                  href={linkMatch[2]}
                  target={linkMatch[2].startsWith('http') ? '_blank' : '_self'}
                  className="text-[#BE3144] font-bold underline hover:text-[#872341] inline-flex items-center gap-0.5"
                >
                  {linkMatch[1]}
                  <ExternalLink className="w-2.5 h-2.5 inline" />
                </Link>
              )
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <aside aria-label="Support Chat" className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#BE3144] via-[#F05941] to-[#BE3144] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40"
          aria-label="Open RollBot Assistant"
        >
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner">
              🌯
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-wider leading-none">Ask RollBot</p>
            <p className="text-[10px] text-white/80 font-medium leading-tight">Live AI & Order Helper</p>
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-neutral-200/90 flex flex-col overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#22092C] via-[#351044] to-[#872341] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl">
                  🌯
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#22092C] rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-sm flex items-center gap-1.5">
                  <span>RollBot</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">AI Chef</span>
                </h3>
                <p className="text-[10px] text-neutral-300">Live kathis, status & order desk</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                title="Clear Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-[#FFF8F5] border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSendMessage('Track my order')}
              className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-700 hover:border-[#BE3144] hover:text-[#BE3144] whitespace-nowrap shadow-2xs transition-colors"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => handleSendMessage('Recommend best seller rolls')}
              className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-700 hover:border-[#BE3144] hover:text-[#BE3144] whitespace-nowrap shadow-2xs transition-colors"
            >
              🔥 Top Rolls
            </button>
            <button
              onClick={() => handleSendMessage('What are current discount coupons?')}
              className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-700 hover:border-[#BE3144] hover:text-[#BE3144] whitespace-nowrap shadow-2xs transition-colors"
            >
              🎟️ Offers
            </button>
            <button
              onClick={() => handleSendMessage('What are your opening hours?')}
              className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-700 hover:border-[#BE3144] hover:text-[#BE3144] whitespace-nowrap shadow-2xs transition-colors"
            >
              ⏰ Timings
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-neutral-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#22092C] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    🌯
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <div className="leading-relaxed">{renderFormattedText(m.text)}</div>
                  <p className={`text-[9px] ${m.sender === 'user' ? 'text-white/70 text-right' : 'text-neutral-400'}`}>
                    {m.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-neutral-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#22092C] text-white flex items-center justify-center text-xs">
                  🌯
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#BE3144] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#BE3144] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#BE3144] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Handover Bar */}
          <div className="px-3 py-1.5 bg-[#25D366]/10 border-t border-[#25D366]/20 flex items-center justify-between text-[10px]">
            <span className="text-emerald-950 font-bold flex items-center gap-1">
              💬 Need urgent human help?
            </span>
            <a
              href="https://wa.me/919876543210?text=Hi%20RockinRoll%20Kitchen%2C%20I%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#128C7E] font-black uppercase hover:underline flex items-center gap-0.5"
            >
              WhatsApp Us <ChevronRight className="w-3 h-3" />
            </a>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about rolls, order status, coupons..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:border-[#BE3144]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </aside>
  )
}
