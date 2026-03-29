import React, { useEffect, useRef, useState, FormEvent } from "react";
import { companyInfo } from "../companyInfo";

/* ================= TYPES ================= */
type Role = "user" | "model";

interface ChatItem {
  role: Role;
  text: string;
  hideInChat?: boolean;
  isError?: boolean;
}

/* ================= ICON ================= */
const ChatbotIcon: React.FC = () => {
  return (
    <img
      src="../image/1538298822.svg"
      alt="ChatbotAIassistant"
      // Thêm các class quan trọng vào
      className="w-12 h-12 p-1 object-contain"
    />
  );
};

/* ================= MESSAGE ================= */
const ChatMessage: React.FC<{ chat: ChatItem }> = ({ chat }) => {
  if (chat.hideInChat) return null;

  const isBot = chat.role === "model";

  return (
    <div
      className={`flex gap-2 ${isBot ? "items-start" : "flex-col items-end"}`}
    >
      {isBot && <ChatbotIcon />}
      <p
        className={`px-4 py-2 text-sm rounded-xl max-w-[75%] whitespace-pre-line ${
          isBot
            ? "bg-purple-100 rounded-bl-sm"
            : "bg-sky-500 text-white rounded-br-sm"
        } ${chat.isError ? "text-red-500" : ""}`}
      >
        {chat.text}
      </p>
    </div>
  );
};

/* ================= FORM ================= */
interface ChatFormProps {
  chatHistory: ChatItem[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatItem[]>>;
  generateBotResponse: (history: ChatItem[]) => void;
}

const ChatForm: React.FC<ChatFormProps> = ({
  chatHistory,
  setChatHistory,
  generateBotResponse,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const message = inputRef.current?.value.trim();
    if (!message) return;

    if (inputRef.current) inputRef.current.value = "";

    setChatHistory((prev) => [...prev, { role: "user", text: message }]);

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { role: "model", text: "Thinking..." },
      ]);

      generateBotResponse([
        ...chatHistory,
        {
          role: "user",
          text: `Using the details provided above, please address this query: ${message}`,
        },
      ]);
    }, 600);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border rounded-full p-2"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="flex-1 outline-none px-3"
        required
      />
      <button className="bg-sky-500 text-white px-3 py-1 rounded-full">
        ↑
      </button>
    </form>
  );
};

/* ================= MAIN COMPONENT ================= */
const ChatbotItems: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    {
      role: "model",
      text: companyInfo,
      hideInChat: true,
    },
  ]);

  const [open, setOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const generateBotResponse = async (history: ChatItem[]) => {
    const update = (text: string, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((m) => m.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    const formatted = history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    try {
      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formatted }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data.error?.message || data);
        throw new Error("Đã xảy ra lỗi gì đó !!!");
      }

      const text = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      update(text);
    } catch (err: any) {
      console.error("Catch Error:", err); //  log chi tiết lỗi
      update("Đã xảy ra lỗi gì đó !!!", true); //  hiển thị cho user
    }
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-300 ease-in-out
hover:scale-110 hover:bg-slate-800 hover:shadow-2xl active:scale-95 "
      >
        <img
          src="../image/1538298822.svg"
          alt="ChatbotAIassistant"
          // Thêm các class quan trọng vào
          className="max-w-full max-h-full object-contain"
        />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-sky-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChatbotIcon />
              <h2 className="font-semibold">Chatbot</h2>
            </div>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Body */}
          <div
            ref={chatRef}
            className="h-[400px] overflow-y-auto p-4 flex flex-col gap-3"
          >
            <div className="flex gap-2">
              <ChatbotIcon />
              <p className="bg-purple-100 px-4 py-2 rounded-xl text-sm">
                MoonLight Xin Chào Quý Khách 👋 <br /> Bạn có thắc mắc nào cần
                giải đáp ?
              </p>
            </div>

            {chatHistory.map((chat, i) => (
              <ChatMessage key={i} chat={chat} />
            ))}
          </div>

          {/* Footer */}
          <div className="p-3">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotItems;
