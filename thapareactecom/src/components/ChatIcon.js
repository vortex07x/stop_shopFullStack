// src/components/ChatIcon.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import "./ChatIcon.css"; // ✅ import styles

const ChatIcon = ({ isLoginOpen }) => {
  const navigate = useNavigate();

  if (isLoginOpen) return null;

  return (
    <div className="chat-icon-container">
      <button
        onClick={() => navigate("/chat")}
        className="chat-icon-btn"
        aria-label="Chat with us"
      >
        <MessageCircle color="white" size={36} />
      </button>
      <span className="chat-tooltip">💬 Chat to know more</span>
    </div>
  );
};

export default ChatIcon;
