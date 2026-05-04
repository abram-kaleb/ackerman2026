// Box8.jsx
import React, { useState } from 'react'

const Box8 = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'EVA: Based on vibration data, Tool 7 is showing abnormal wear. Recommend check.' },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now(), role: 'user', text: input }])
    setInput('')
  }

  return (
    <div className="bg-black rounded-2xl flex flex-col w-full h-full text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
      <h1 className="text-black bg-white px-2 rounded-sm text-sm font-bold uppercase">
        Ask Ackerman
      </h1>
        <div className="flex gap-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[90%] p-3 text-[13px] leading-relaxed border ${
              msg.role === 'ai' 
                ? 'bg-[#1e212b] border-[#2d313e] self-start rounded-xl rounded-tl-none' 
                : 'bg-[#252836] border-[#383c4d] self-end ml-auto rounded-xl rounded-br-none'
            }`}
          >
            {msg.role === 'ai' ? (
              <p>
                <span className="text-green-500 font-bold">EVA:</span> {msg.text.replace('EVA: ', '')}
              </p>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 relative">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="How can I reduce Spindle Vibration?"
            className="w-full bg-[#1e212b] border border-[#383c4d] rounded-lg py-3 px-4 pr-12 text-sm focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="opacity-60">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Box8