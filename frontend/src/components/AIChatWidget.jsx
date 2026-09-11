import React, { useState, useContext, useRef, useEffect } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function AIChatWidget() {
  const { lang } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize initial greeting when drawer opens / language changes
  useEffect(() => {
    if (messages.length === 0) {
      let greeting =
        "👋 Hello! I am DairyGuard AI Assistant. Ask me anything!";
      if (lang === "hi") {
        greeting =
          "👋 नमस्ते! मैं डेयरीगार्ड AI असिस्टेंट हूँ। आप मुझसे कुछ भी पूछ सकते हैं!";
      } else if (lang === "mr") {
        greeting =
          "👋 नमस्कार! मी डेअरीगार्ड AI असिस्टंट आहे. तुम्ही मला काहीही विचारू शकता!";
      }
      setMessages([{ sender: "bot", text: greeting }]);
    }
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text || !text.trim()) return;

    const userMessage = { sender: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), lang })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚠️ Unable to fetch response. Please try again." }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Network connection issue. Please check your backend connection." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickChips = () => {
    if (lang === "hi") {
      return [
        "🌾 साइलेज गुणवत्ता कैसे मापें?",
        "🐄 पशु स्वास्थ्य टिप्स",
        "💡 कुछ भी पूछें"
      ];
    }
    if (lang === "mr") {
      return [
        "🌾 सायलेज गुणवत्ता तपासणी",
        "🐄 जनावरांचे आरोग्य टिप्स",
        "💡 काहीही विचारा"
      ];
    }
    return [
      "🌾 Silage quality guide",
      "🐄 Animal health tips",
      "💡 Ask me anything"
    ];
  };

  const chips = getQuickChips();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Floating Bottom-Right Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            background: "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "0.75rem 1.25rem",
            borderRadius: "50px",
            boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.92rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: "blur(8px)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 14px 30px -5px rgba(2, 132, 199, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(2, 132, 199, 0.5)";
          }}
        >
          <span style={{ fontSize: "1.35rem", display: "inline-block" }}>✨</span>
          <span>
            {lang === "hi"
              ? "AI सहायता"
              : lang === "mr"
              ? "AI मदत"
              : "AI Assistant"}
          </span>
          <span
            style={{
              width: "9px",
              height: "9px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              boxShadow: "0 0 8px #10b981"
            }}
          />
        </button>
      )}

      {/* Floating Bottom-Right Expandable Chat Window */}
      {isOpen && (
        <div
          style={{
            width: "380px",
            maxWidth: "calc(100vw - 32px)",
            height: "520px",
            maxHeight: "calc(100vh - 100px)",
            background: "var(--card-bg, #ffffff)",
            border: "1px solid var(--card-border, #e2e8f0)",
            borderRadius: "20px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.3s ease"
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
              color: "#ffffff",
              padding: "0.95rem 1.1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.98rem", letterSpacing: "0.01em" }}>
                  DairyGuard AI Assistant
                </div>
                <div style={{ fontSize: "0.74rem", opacity: 0.9, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#34d399",
                      boxShadow: "0 0 6px #34d399"
                    }}
                  />
                  <span>Powered by Mistral AI</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
            >
              ✕
            </button>
          </div>

          {/* Quick Suggestion Chips (Scrollbar hidden via no-scrollbar) */}
          <div
            className="no-scrollbar"
            style={{
              padding: "0.6rem 0.85rem",
              background: "var(--panel-bg, #f8fafc)",
              borderBottom: "1px solid var(--card-border, #f1f5f9)",
              display: "flex",
              gap: "0.5rem",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.replace(/^[^\s]+\s/, ""))}
                style={{
                  whiteSpace: "nowrap",
                  background: "var(--card-bg, #ffffff)",
                  border: "1px solid #cbd5e1",
                  color: "var(--text-dark, #334155)",
                  fontSize: "0.75rem",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0284c7";
                  e.currentTarget.style.color = "#0284c7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.color = "var(--text-dark, #334155)";
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Area (Scrollbar hidden visually via no-scrollbar class) */}
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexDirection: m.sender === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end"
                }}
              >
                {/* Avatar Icon */}
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: m.sender === "user" ? "#0284c7" : "#059669",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {m.sender === "user" ? "🧑‍🌾" : "🤖"}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: "80%",
                    background:
                      m.sender === "user"
                        ? "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)"
                        : "var(--panel-bg, #f1f5f9)",
                    color: m.sender === "user" ? "#ffffff" : "var(--text-dark, #0f172a)",
                    padding: "0.7rem 0.95rem",
                    borderRadius:
                      m.sender === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    boxShadow:
                      m.sender === "user"
                        ? "0 4px 12px rgba(37, 99, 235, 0.2)"
                        : "0 2px 6px rgba(0, 0, 0, 0.04)",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#059669",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem"
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    background: "var(--panel-bg, #f1f5f9)",
                    color: "var(--text-muted, #64748b)",
                    padding: "0.6rem 0.9rem",
                    borderRadius: "16px 16px 16px 4px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: "0.75rem 0.85rem",
              background: "var(--card-bg, #ffffff)",
              borderTop: "1px solid var(--card-border, #e2e8f0)",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center"
            }}
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "कुछ भी पूछें..."
                  : lang === "mr"
                  ? "काहीही विचारा..."
                  : "Ask anything..."
              }
              style={{
                flex: 1,
                padding: "0.65rem 0.9rem",
                borderRadius: "24px",
                border: "1px solid var(--input-border, #cbd5e1)",
                backgroundColor: "var(--input-bg, #f8fafc)",
                color: "var(--input-text, #0f172a)",
                fontSize: "0.85rem",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0284c7";
                e.target.style.boxShadow = "0 0 0 3px rgba(2, 132, 199, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--input-border, #cbd5e1)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              style={{
                background:
                  loading || !inputMsg.trim()
                    ? "#cbd5e1"
                    : "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                cursor: loading || !inputMsg.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  loading || !inputMsg.trim()
                    ? "none"
                    : "0 4px 12px rgba(2, 132, 199, 0.3)"
              }}
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
