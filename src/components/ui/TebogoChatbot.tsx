import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { supabase } from '../../supabase';

export default function TebogoChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('tebogo_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('tebogo_session_id', id);
    }
    return id;
  });
  const [messages, setMessages] = useState<any[]>([
    { id: 'initial', role: 'ai', text: "Greetings. I am Tebogo, your Super Intelligent AI Assistant. How may I accelerate your journey within the NeuroGrowth Labs ecosystem today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'chat_sessions', sessionId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const initialMessage = { id: 'initial', role: 'ai', text: "Greetings. I am Tebogo, your Super Intelligent AI Assistant. How may I accelerate your journey within the NeuroGrowth Labs ecosystem today?" };
      
      if (fetchedMessages.length > 0) {
        setMessages([initialMessage, ...fetchedMessages]);
      } else {
        setMessages([initialMessage]);
      }
    }, (error) => {
      console.warn("Firestore onSnapshot error:", error);
    });
    
    return () => unsubscribe();
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
    
    // 1. Dual-write user message
    try {
      await addDoc(messagesRef, {
        role: 'user',
        text: userMessage,
        timestamp: serverTimestamp()
      });
    } catch (fErr) {
      console.warn("Firebase save chatbot message failed:", fErr);
    }

    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        text: userMessage,
        created_at: new Date().toISOString()
      });
    } catch (sErr) {
      console.warn("Supabase save chatbot message failed:", sErr);
    }

    // Simulate AI response with context
    setTimeout(async () => {
      setIsTyping(false);
      const aiResponse = `I see you are exploring our ${window.location.pathname} page. I am processing your request through our intelligence layer. While I currently function in a demonstration capacity, this interaction stream is being optimized for future full-stack automation.`;
      
      // 2. Dual-write AI response
      try {
        await addDoc(messagesRef, {
          role: 'ai',
          text: aiResponse,
          systemPromptContext: `Current Page URL: ${window.location.href}`,
          timestamp: serverTimestamp()
        });
      } catch (fErr) {
        console.warn("Firebase save chatbot AI message failed:", fErr);
      }

      try {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'ai',
          text: aiResponse,
          system_prompt_context: `Current Page URL: ${window.location.href}`,
          created_at: new Date().toISOString()
        });
      } catch (sErr) {
        console.warn("Supabase save chatbot AI message failed:", sErr);
      }
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-ai-cyan text-midnight-black shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] flex items-center justify-center z-50 transition-shadow"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-midnight-black/95 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 border-b border-glass-border flex items-center justify-between px-4 bg-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-ai-cyan/10 to-transparent pointer-events-none" />
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-8 h-8 rounded-full bg-ai-cyan/20 border border-ai-cyan/50 flex items-center justify-center">
                   <Bot className="w-4 h-4 text-ai-cyan" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm tracking-wide">Tebogo AI</h3>
                   <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[10px] uppercase font-mono text-quantum-silver tracking-wider">Online</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-2 relative z-10">
                 <button onClick={() => setIsOpen(false)} className="text-quantum-silver hover:text-white transition-colors p-1">
                   <Minimize2 className="w-4 h-4" />
                 </button>
               </div>
            </div>

            {/* Chat Area */}
            <motion.div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
                    }}
                    className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-ai-cyan text-midnight-black rounded-tr-sm font-medium' 
                        : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/10 text-white rounded-2xl rounded-tl-sm p-4 w-16 flex justify-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 bg-ai-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-ai-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-ai-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>

            {/* Input Area */}
            <div className="p-4 border-t border-glass-border bg-white/5">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Tebogo..."
                  className="w-full bg-midnight-black/50 border border-glass-border rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-ai-cyan focus:bg-white/5 transition-colors placeholder:text-quantum-silver/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ai-cyan text-midnight-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-quantum-silver font-mono uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-ai-cyan" />
                <span>Super Intelligent Agent Protocol</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
