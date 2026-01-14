'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, X, Send, Loader, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are the BulkBuddy AI Assistant helping users navigate our B2B group buying platform. BulkBuddy lets buyers and suppliers collaborate on bulk purchases - as more buyers join a pool, prices automatically drop, creating a win-win for everyone.

KEY FEATURES:
- Buyer Dashboard: Discover pools, find suppliers via Google Maps, join groups, track savings
- Supplier Dashboard: Create deals with tiered pricing, manage orders, monitor real-time volume
- Smart Pricing: Automatic discounts when volume milestones are reached
- Real-time Updates: Watch volume grow and prices drop as buyers join

MAIN PAGES:
- Home (/): Landing page explaining the platform
- Buyer Dashboard (/buyer-dashboard): Browse active pools and discover suppliers
- Supplier Dashboard (/supplier-dashboard): Create and manage deals
- Sign In/Sign Up (/sign-in, /sign-up): User authentication
- Pool Details (/pool/[id]): Join a specific pool

HOW IT WORKS:
Suppliers create deals with base prices and volume-based tiers. As buyers join a pool and the total volume increases, everyone gets automatically better pricing. Buyers get discounts, suppliers get higher volumes.

YOUR ROLE:
Help users navigate the platform, explain how group buying works, guide them through the sign-up and purchasing process, answer questions about features and savings, and provide a friendly, supportive experience.

Be clear, encouraging, and specific about page URLs and features. Use examples from the platform when helpful.`;


export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! 👋 I\'m your BulkBuddy AI Assistant. I\'m here to help you navigate the platform, find great deals, and answer any questions about group buying. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  // Initialize Gemini API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
    } else {
      setError('Gemini API key not configured');
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !genAI || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

      // Build conversation history excluding the initial welcome message and current input
      const previousMessages = messages.slice(-10); // Last 10 messages for context
      
      // Filter to only include messages from actual conversation (skip initial assistant welcome)
      let historyMessages = previousMessages.filter((msg, index) => {
        // Skip the first message if it's from the assistant (initial welcome)
        if (index === 0 && msg.role === 'assistant' && messages.length > 1) {
          return false;
        }
        return true;
      });

      // Build history array for Gemini - must start with user role
      const conversationHistory = historyMessages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: conversationHistory.length > 0 && conversationHistory[0].role === 'user' 
          ? conversationHistory 
          : [], // Start with empty history if it doesn't begin with user
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(
        conversationHistory.length === 0 
          ? `${SYSTEM_PROMPT}\n\nUser question: ${input}`
          : input
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response.text(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from AI';
      
      // User-friendly error messages for common issues
      let displayError = errorMessage;
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        displayError = 'API quota exceeded. Please try again in a few moments. The assistant will be available shortly.';
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        displayError = 'API authentication failed. Please check your Gemini API key in .env.local';
      } else if (errorMessage.includes('404')) {
        displayError = 'Model not found. Please try refreshing the page.';
      }
      
      setError(displayError);
      console.error('Gemini API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button - Minimized */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 dark:from-blue-500 dark:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group animate-pulse"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute bottom-full mb-3 bg-slate-900 dark:bg-slate-950 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Chat with AI Assistant
          </span>
        </button>
      )}

      {/* Full-Screen Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container - Vertical Panel */}
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[90vh] md:h-[85vh] w-full md:w-96 md:mr-6 md:mb-6 overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-500 dark:to-emerald-500 p-4 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-lg">BulkBuddy Assistant</h3>
                <p className="text-sm text-blue-100">Powered by Google Gemini AI</p>
              </div>
              <button
                onClick={() => {
                  setIsMinimized(!isMinimized);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isMinimized ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Container */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl transition-all ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm break-words leading-relaxed">{message.content}</p>
                        <p className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          You
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start gap-3 animate-in fade-in">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                        AI
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl text-sm animate-in shake">
                      ❌ {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-slate-200 dark:border-slate-700 p-4 flex gap-3 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading || !genAI}
                    className="flex-1 px-4 py-3 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !genAI || !input.trim()}
                    className="px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-500 dark:to-emerald-500 hover:shadow-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {!genAI && (
                  <div className="bg-amber-100 dark:bg-amber-900 border-t border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs">
                    ⚠️ Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
