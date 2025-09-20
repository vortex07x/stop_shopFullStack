import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey 👋 How can I help you today?" }, // ✅ Initial greeting
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const handleSend = () => {
    if (!input.trim()) return;

    // ✅ Only push user message (no AI reply here)
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Wrapper>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={26} color="#fff" />
          </button>
          <h2>AI Chat</h2>
        </div>

        {/* Messages */}
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === "user" ? "user" : "ai"}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="input-box">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          <button onClick={handleSend}>
            <Send size={26} color="#fff" />
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f9f9fb;
  padding: 2rem;

  .chat-container {
    width: 100%;
    max-width: 900px;
    height: 90vh;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: inset 0 0 25px 5px rgba(0, 0, 0, 0.35);

    /* ✅ Background image with opacity */
    background: url("/images/social-media-sketch-vector-seamless-600nw-1660950727.webp")
      center/cover no-repeat;
    position: relative;
  }

  .chat-container::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8); /* lowers opacity */
    border-radius: 16px;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #ddd;
    background: rgba(255, 255, 255, 0.9);
    position: relative;
    z-index: 1;
  }

  .chat-header .back-btn {
    background: #6c63ff;
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
    color: #333;
  }

  .messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: relative;
    z-index: 1;
  }

  .message {
    max-width: 70%;
    padding: 14px 20px;
    border-radius: 18px;
    font-size: 18px;
    line-height: 1.6;
  }

  .message.user {
    background: #6c63ff;
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 6px;
  }

  .message.ai {
    background: #f0f2f7;
    color: #333;
    align-self: flex-start;
    border-bottom-left-radius: 6px;
  }

  .input-box {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #ddd;
    background: rgba(255, 255, 255, 0.9);
    gap: 1rem;
    position: relative;
    z-index: 1;
  }

  .input-box input {
    flex: 1;
    border: none;
    outline: none;
    padding: 1.4rem 1.8rem;
    font-size: 1.6rem;
    border-radius: 30px;
    background: #e0e3f8;
    color: #222;
    text-transform: none;
  }

  .input-box button {
    background: #6c63ff;
    border: none;
    border-radius: 50%;
    width: 55px;
    height: 55px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    flex-shrink: 0;
  }

  .input-box button:hover {
    background: #5648d1;
  }
`;

export default Chat;
