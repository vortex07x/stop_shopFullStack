import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import "./ChatIcon.css";

const ChatIcon = ({ isLoginOpen }) => {
  const navigate = useNavigate();

  if (isLoginOpen) return null;

  return (
    <div className="chat-icon-container">
      <button
        onClick={() => navigate("/chat")}
        className="chat-icon-btn"
        aria-label="Chat with AI Assistant"
      >
        <Bot color="white" size={28} />
      </button>
      <span className="chat-tooltip">🤖 Chat with AI Assistant</span>
    </div>
  );
};

export default ChatIcon;