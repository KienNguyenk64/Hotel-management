import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Moon, RefreshCcw, Loader2, Sparkles, ChevronRight, ThumbsUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatbotApi, roomApi } from '../services/api';
import { ChatMessage, RoomType } from '../types';
import { useNavigate } from 'react-router-dom';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen, showFeedback]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !showFeedback && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, showFeedback]);

  // Init session or restore
  useEffect(() => {
    const savedSession = localStorage.getItem('chatbot_session_id');
    if (savedSession) {
        setSessionId(savedSession);
    }
  }, []);

  // Fetch history when opening
  useEffect(() => {
    if (isOpen && sessionId && messages.length === 0) {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const response = await chatbotApi.getConversationHistory(sessionId);
                if (response.data.status === "success") {
                    // Normalize backend messages to frontend format
                    const history = response.data.data.messages?.map((msg: any) => ({
                        ...msg,
                        content: msg.content || msg.text, 
                        type: msg.type || 'TEXT',
                        sender: msg.sender || (msg.role === 'user' ? 'USER' : 'BOT')
                    })) || [];
                    setMessages(history);
                }
            } catch (error) {
                // If session is invalid or expired, clear it silently
                localStorage.removeItem('chatbot_session_id');
                setSessionId(null);
            } finally {
                setIsLoadingHistory(false);
            }
        }
        fetchHistory();
    }
  }, [isOpen, sessionId]);

  const addMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
  };

  const startNewSession = async (initialMessage?: string) => {
      setIsTyping(true);
      try {
          const response = await chatbotApi.startSession(user?.id, user?.fullName);
          if (response.data.status === "success") {
              const newSessionId = response.data.data.sessionId;
              setSessionId(newSessionId);
              localStorage.setItem('chatbot_session_id', newSessionId);
              
              if (initialMessage) {
                  await sendMessageToApi(initialMessage, newSessionId);
              } else {
                  // Greeting if opened without action
                  addMessage({
                      type: 'TEXT',
                      sender: 'BOT',
                      content: `Xin chào ${user?.fullName || 'quý khách'}! Tôi là trợ lý ảo của Moon Palace. Tôi có thể giúp gì cho bạn hôm nay?`,
                      quickReplies: [
                          { text: "Đặt phòng", value: "Tôi muốn đặt phòng" },
                          { text: "Giá phòng", value: "Giá phòng hiện tại thế nào?" },
                          { text: "Tiện ích", value: "Khách sạn có những tiện ích gì?" }
                      ]
                  });
              }
          }
      } catch (error) {
          console.error("Failed to start session", error);
          addMessage({
              type: 'TEXT',
              sender: 'BOT',
              content: "Xin lỗi, tôi không thể khởi tạo cuộc trò chuyện lúc này. Vui lòng thử lại sau."
          });
      } finally {
          setIsTyping(false);
      }
  }

  // --- HYBRID INTELLIGENCE: Local Room Lookup ---
  const fetchRoomSuggestions = async (text: string): Promise<any[]> => {
    const lowerText = text.toLowerCase();
    let type: RoomType | undefined;

    // Simple keyword matching for room types to augment bot response
    if (lowerText.includes('standard')) type = RoomType.STANDARD;
    else if (lowerText.includes('superior')) type = RoomType.SUPERIOR;
    else if (lowerText.includes('deluxe')) type = RoomType.DELUXE;
    else if (lowerText.includes('suite')) type = RoomType.SUITE;
    else if (lowerText.includes('executive')) type = RoomType.EXECUTIVE;
    else if (lowerText.includes('president') || lowerText.includes('tổng thống')) type = RoomType.PRESIDENTIAL;
    else if (lowerText.includes('family') || lowerText.includes('gia đình')) type = RoomType.FAMILY;
    else if (lowerText.includes('honeymoon') || lowerText.includes('cặp đôi')) type = RoomType.HONEYMOON;

    if (type) {
      try {
        const res = await roomApi.getByType(type);
        if (res.data.status === 'success' && res.data.data.length > 0) {
          // Map real rooms to Chat Cards
          return res.data.data.slice(0, 5).map(room => ({
            title: room.name,
            subtitle: `${room.pricePerNight.toLocaleString()} VNĐ • ${room.size}m² • ${room.view}`,
            imageUrl: room.thumbnailImage || room.images[0],
            buttonText: 'Xem chi tiết',
            buttonLink: `/room/${room.id}`,
            buttonAction: 'NAVIGATE'
          }));
        }
      } catch (e) {
        console.error("Failed to fetch local suggestions", e);
      }
    }
    return [];
  };

  const sendMessageToApi = async (text: string, activeSessionId: string, retryCount = 0) => {
      try {
        // 1. Parallel: Fetch local room suggestions based on keywords
        const localSuggestionsPromise = fetchRoomSuggestions(text);
        
        // 2. Send message to Bot API
        const apiPromise = chatbotApi.sendMessage({
            message: text,
            sessionId: activeSessionId,
            userId: user?.id
        });

        const [localSuggestions, response] = await Promise.all([localSuggestionsPromise, apiPromise]);

        if (response.data.status === "success") {
            const data = response.data.data;
            
            // 3. Merge Local Cards with Bot Cards (if any)
            const combinedCards = [
                ...(data.cards || []),
                ...localSuggestions
            ];

            const botMsg: ChatMessage = {
                type: (data.messageType as any) || 'TEXT',
                sender: 'BOT',
                content: data.message,
                quickReplies: data.quickReplies,
                cards: combinedCards // Use the combined list
            };
            addMessage(botMsg);
        } else {
            throw new Error(response.data.message || "Unknown error");
        }
    } catch (error: any) {
        console.error("Chat error", error);
        
        // Auto-healing: If session is invalid (400/404), reset and retry once
        if (retryCount < 1 && (error.response?.status === 400 || error.response?.status === 404)) {
            console.log("Session expired/invalid, refreshing...");
            
            // 1. Clear old session
            localStorage.removeItem('chatbot_session_id');
            setSessionId(null);

            // 2. Start new session directly
            try {
                const startRes = await chatbotApi.startSession(user?.id, user?.fullName);
                if (startRes.data.status === "success") {
                    const newSessionId = startRes.data.data.sessionId;
                    setSessionId(newSessionId);
                    localStorage.setItem('chatbot_session_id', newSessionId);
                    
                    // Retry message with new ID
                    await sendMessageToApi(text, newSessionId, retryCount + 1);
                    return;
                }
            } catch (setupError) {
                console.error("Failed to recover session", setupError);
            }
        }

        addMessage({ 
            type: 'TEXT', 
            sender: 'BOT', 
            content: "Xin lỗi, tôi đang gặp sự cố kết nối hoặc phiên chat đã hết hạn. Vui lòng tải lại trang."
        });
    }
  }

  const handleSend = async (e?: React.FormEvent, msgText?: string) => {
    if (e) e.preventDefault();
    const textToSend = msgText || inputValue.trim();

    if (!textToSend) return;

    // 1. Display User Message Immediately
    const userMsg: ChatMessage = { 
        type: 'TEXT', 
        sender: 'USER', 
        content: textToSend 
    };
    addMessage(userMsg);
    setInputValue("");
    setIsTyping(true);

    // 2. Logic: Start Session OR Send Message
    if (!sessionId) {
        await startNewSession(textToSend);
    } else {
        await sendMessageToApi(textToSend, sessionId);
        setIsTyping(false);
    }
  };

  const handleQuickReply = (value: string) => {
      handleSend(undefined, value);
  }

  const handleCardAction = (action?: string, link?: string) => {
      if (!link) return;
      if (link.startsWith('/')) {
          navigate(link);
          setIsOpen(false); // Close chat if navigating internally
      } else {
          window.open(link, '_blank');
      }
  }

  const handleResetSession = async () => {
      if (sessionId && !showFeedback) {
          // Ask for feedback before resetting if not already showing
          setShowFeedback(true);
      } else {
          // Hard reset
          forceReset();
      }
  }

  const forceReset = async () => {
      if (sessionId) {
        try {
            await chatbotApi.endSession(sessionId);
        } catch (e) { console.warn('End session failed', e); }
      }
      localStorage.removeItem('chatbot_session_id');
      setSessionId(null);
      setMessages([]);
      setShowFeedback(false);
      setFeedbackSubmitted(false);
      setRating(0);
      setFeedbackText("");
      // Restart immediately
      startNewSession();
  }

  const submitFeedback = async () => {
      if (!sessionId || rating === 0) return;
      
      setIsSubmittingFeedback(true);
      try {
          await chatbotApi.submitFeedback({
              sessionId,
              rating,
              feedback: feedbackText,
              wasHelpful: rating >= 4
          });
          setFeedbackSubmitted(true);
          setTimeout(() => {
              forceReset(); // Reset after feedback
          }, 1500);
      } catch (error) {
          console.error("Feedback error", error);
          forceReset();
      } finally {
          setIsSubmittingFeedback(false);
      }
  }

  const renderText = (text: string) => {
      // Basic URL detection
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = text.split(urlRegex);
      return parts.map((part, i) => 
          part.match(urlRegex) ? (
              <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all font-medium underline-offset-2">
                  {part}
              </a>
          ) : part
      );
  };

  return (
    <div className={`fixed right-6 z-50 font-sans transition-all duration-500 ease-in-out ${isOpen ? 'bottom-6' : 'bottom-24'}`}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-800 opacity-100 group-hover:opacity-90 transition-opacity"></div>
          <MessageCircle size={32} className="text-white relative z-10" />
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in-up h-[600px] max-h-[85vh] transition-all">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white relative shadow-md shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-indigo-400 text-slate-900 shadow-inner">
                <Moon size={22} className="text-indigo-600"/>
              </div>
              <div>
                <p className="font-bold text-base leading-none mb-1 font-serif tracking-wide">Moon Assistant</p>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span>
                    <p className="text-[10px] text-slate-200 uppercase tracking-wider font-medium opacity-90">Trực tuyến</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
                <button 
                    onClick={handleResetSession} 
                    title="Làm mới cuộc trò chuyện" 
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-200 hover:text-white"
                >
                    <RefreshCcw size={18}/>
                </button>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-200 hover:text-white"
                >
                    <X size={22} />
                </button>
            </div>
          </div>

          {/* Feedback Overlay */}
          {showFeedback && (
              <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 animate-fade-in text-center z-20 absolute inset-0 top-[72px]">
                  {feedbackSubmitted ? (
                      <div className="animate-scale-in">
                          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ThumbsUp size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Cảm ơn bạn!</h3>
                          <p className="text-slate-500 text-sm">Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>
                      </div>
                  ) : (
                      <>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Đánh giá cuộc trò chuyện</h3>
                        <p className="text-slate-500 text-sm mb-6">Bạn có hài lòng với sự hỗ trợ của Moon Assistant không?</p>
                        
                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star 
                                        size={32} 
                                        className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-100'} transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Chia sẻ thêm ý kiến của bạn (tùy chọn)..."
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                            rows={3}
                        />

                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => {setShowFeedback(false); setRating(0);}} 
                                className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50"
                            >
                                Bỏ qua
                            </button>
                            <button 
                                onClick={submitFeedback}
                                disabled={rating === 0 || isSubmittingFeedback}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmittingFeedback ? <Loader2 className="animate-spin" size={16}/> : 'Gửi đánh giá'}
                            </button>
                        </div>
                      </>
                  )}
              </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#F8F9FA] scroll-smooth relative">
            {isLoadingHistory ? (
                <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-3">
                    <Loader2 className="animate-spin text-indigo-500" size={32}/>
                    <span className="text-xs font-bold uppercase tracking-wider">Đang tải lịch sử...</span>
                </div>
            ) : messages.length === 0 ? (
                // Welcome Screen
                <div className="flex flex-col items-center justify-center h-full text-center p-2 animate-fade-in">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-5 border border-slate-100 p-4 relative group">
                        <div className="absolute inset-0 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                        <Sparkles size={40} className="text-indigo-500 relative z-10" fill="#E0E7FF"/>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Xin chào, {user?.fullName?.split(' ').pop() || 'Quý khách'}!</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-[280px]">
                        Tôi là trợ lý AI. Hãy chọn một chủ đề bên dưới để bắt đầu nhé!
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button onClick={() => handleQuickReply('Tôi muốn đặt phòng')} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group">
                            <span className="text-xl block mb-1">📅</span>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Đặt phòng</span>
                        </button>
                        <button onClick={() => handleQuickReply('Giá phòng hiện tại?')} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group">
                            <span className="text-xl block mb-1">💰</span>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Bảng giá</span>
                        </button>
                        <button onClick={() => handleQuickReply('Tiện ích khách sạn có gì?')} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group">
                            <span className="text-xl block mb-1">🏊</span>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Tiện ích</span>
                        </button>
                        <button onClick={() => handleQuickReply('Tôi cần hỗ trợ khác')} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group">
                            <span className="text-xl block mb-1">📞</span>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Hỗ trợ khác</span>
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'} animate-fade-in-up group`}>
                        {/* Avatar for Bot */}
                        {msg.sender === 'BOT' && (
                             <div className="flex items-end gap-2 max-w-[90%]">
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mb-1 border border-indigo-200 shadow-sm">
                                    <Moon size={12} className="text-white"/>
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    {msg.content && (
                                        <div className="bg-white text-slate-800 border border-slate-100 p-3.5 rounded-2xl rounded-bl-none shadow-sm text-sm leading-relaxed">
                                            {renderText(msg.content)}
                                        </div>
                                    )}
                                </div>
                             </div>
                        )}

                        {/* User Message */}
                        {msg.sender === 'USER' && (
                            <div className="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-br-none shadow-md text-sm leading-relaxed max-w-[85%] break-words">
                                {msg.content}
                            </div>
                        )}
                        
                        {/* Cards Carousel */}
                        {msg.cards && msg.cards.length > 0 && (
                            <div className="mt-3 ml-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide w-full pr-2 snap-x">
                                {msg.cards.map((card, cIdx) => (
                                    <div key={cIdx} className="min-w-[220px] max-w-[220px] bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col snap-center hover:shadow-lg transition-all group/card">
                                        {card.imageUrl && (
                                            <div className="h-28 overflow-hidden relative bg-slate-100">
                                                <img 
                                                    src={card.imageUrl} 
                                                    alt={card.title} 
                                                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                                    onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300x200?text=MoonPalace'}
                                                />
                                            </div>
                                        )}
                                        <div className="p-3 flex-1 flex flex-col">
                                            <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 font-serif">{card.title}</h4>
                                            {card.subtitle && <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-snug">{card.subtitle}</p>}
                                            
                                            <button 
                                                onClick={() => handleCardAction(card.buttonAction, card.buttonLink)}
                                                className="mt-auto w-full py-2 bg-slate-50 text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 hover:bg-slate-900 hover:text-white border border-slate-200"
                                            >
                                                {card.buttonText || 'Xem chi tiết'} <ChevronRight size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Replies (Bot Only) */}
                        {msg.quickReplies && msg.quickReplies.length > 0 && (
                            <div className="mt-2 ml-8 flex flex-wrap gap-2 max-w-[90%]">
                                {msg.quickReplies.map((qr, qrIdx) => (
                                    <button 
                                        key={qrIdx}
                                        onClick={() => handleQuickReply(qr.value)}
                                        className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 text-xs font-bold rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                    >
                                        {qr.icon && <span>{qr.icon}</span>}
                                        {qr.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex items-end gap-2 animate-fade-in ml-1">
                             <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mb-1 border border-indigo-200 opacity-70">
                                <Moon size={10} className="text-white"/>
                            </div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={(e) => handleSend(e)} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.03)] relative z-10 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-slate-900 placeholder-slate-400 transition-all disabled:opacity-50"
              disabled={isTyping || showFeedback}
            />
            <button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping || showFeedback} 
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};