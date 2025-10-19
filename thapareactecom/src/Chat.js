import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, ShoppingCart, Package } from "lucide-react";

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Predefined suggestion sets that rotate
  const suggestionSets = [
    ["laptop", "mobile", "my orders"],
    ["help", "accessories", "what's available"],
    ["computer", "electronics", "order history"],
    ["show me phones", "price range", "latest products"],
    ["tech products", "in stock items", "my purchases"]
  ];

  // Initialize with random suggestions
  useEffect(() => {
    setCurrentSuggestions(suggestionSets[Math.floor(Math.random() * suggestionSets.length)]);
  }, []);

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      console.log('=== USER ID DEBUG START ===');
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('Token exists:', !!localStorage.getItem('token'));
      console.log('Token value:', localStorage.getItem('token'));
      console.log('User exists:', !!localStorage.getItem('user'));
      console.log('User string value:', localStorage.getItem('user'));
      
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        console.log('No valid user found in localStorage');
        console.log('=== USER ID DEBUG END ===');
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log('Parsed user object:', user);
      console.log('User ID from object:', user.id);
      console.log('User ID type:', typeof user.id);
      console.log('=== USER ID DEBUG END ===');
      
      return user.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      console.log('=== USER ID DEBUG END ===');
      return null;
    }
  };

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price) return "N/A";
    
    try {
      let numPrice = typeof price === 'string' ? parseFloat(price) : price;
      
      // If price looks like it's in cents (e.g., 2999 = $29.99)
      if (numPrice > 10000) {
        numPrice = numPrice / 100;
      }
      
      return `$${numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } catch {
      return `$${price}`;
    }
  };

  // Helper function to format stock status
  const getStockStatus = (product) => {
    const stock = product.stock || product.stockQuantity;
    if (stock === undefined || stock === null) return { status: "In Stock", inStock: true };
    
    const stockNum = typeof stock === 'string' ? parseInt(stock) : stock;
    return {
      status: stockNum > 0 ? "In Stock" : "Out of Stock",
      inStock: stockNum > 0
    };
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    // Auto-send after a short delay for better UX
    setTimeout(() => {
      sendMessage(suggestion);
    }, 100);
  };

  // Rotate suggestions after each message
  const rotateSuggestions = () => {
    const nextSet = suggestionSets[Math.floor(Math.random() * suggestionSets.length)];
    setCurrentSuggestions(nextSet);
  };

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { sender: "user", text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Rotate suggestions after user sends a message
    rotateSuggestions();

    // Debug the user ID being sent
    const userId = getUserId();
    console.log('=== SENDING MESSAGE ===');
    console.log('Message:', textToSend);
    console.log('User ID being sent:', userId);
    console.log('User ID type:', typeof userId);

    try {
      const requestBody = {
        message: textToSend,
        userId: userId
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch('https://stopshop-backend.onrender.com/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat response received:', data);
      console.log('=== MESSAGE COMPLETE ===');
      
      const aiMessage = { 
        sender: "ai", 
        text: data.message, 
        type: data.type, 
        data: data.data 
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, I'm having trouble connecting right now. Please try again!"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage();

  const handleProductClick = (product) => {
    console.log('Product clicked:', product);
    // navigate(`/product/${product.id}`);
    window.location.href = `/product/${product.id}`;
  };

  const renderProductList = (products) => {
    if (!products || products.length === 0) return null;

    console.log('Rendering product list with', products.length, 'products');

    return (
      <div className="product-list">
        {products.slice(0, 6).map((product, index) => {
          const stockInfo = getStockStatus(product);
          
          return (
            <div 
              key={index} 
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="product-info">
                <h4 className="product-name">{product.name || 'Product Name'}</h4>
                <p className="product-price">{formatPrice(product.price)}</p>
                <span className={`stock-status ${stockInfo.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {stockInfo.status}
                </span>
              </div>
              <div className="product-overlay">
                <ShoppingCart size={20} />
                <span>View Details</span>
              </div>
            </div>
          );
        })}
        {products.length > 6 && (
          <div className="more-products">
            <p>+{products.length - 6} more products available</p>
          </div>
        )}
      </div>
    );
  };

  const renderOrderList = (orders) => {
    if (!orders || orders.length === 0) return null;

    console.log('Rendering order list with', orders.length, 'orders');

    return (
      <div className="order-list">
        {orders.slice(0, 3).map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-header">
              <Package size={18} />
              <span className="order-id">Order #{order.id}</span>
            </div>
            <div className="order-details">
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total:</strong> {formatPrice(order.orderTotal)}</p>
              <p><strong>Status:</strong> {order.status || 'Processing'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMessage = (msg, index) => {
    if (msg.sender === "user") {
      return (
        <div key={index} className="message user">
          {msg.text}
        </div>
      );
    }

    return (
      <div key={index} className="message ai">
        <div className="ai-text">{msg.text}</div>
        
        {msg.type === "product_list" && msg.data && renderProductList(msg.data)}
        {msg.type === "order_list" && msg.data && renderOrderList(msg.data)}
      </div>
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <button className="back-btn" onClick={() => window.location.href = "/"}>
            <ArrowLeft size={26} color="#fff" />
          </button>
          <h2>AI Shopping Assistant</h2>
        </div>

        <div className="messages">
          {messages.map((msg, index) => renderMessage(msg, index))}
          {isLoading && (
            <div className="message ai loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="suggestions-container">
          {currentSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-box"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="input-box">
          <input
            type="text"
            placeholder="Ask me about products, orders, or anything else..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading}>
            <Send size={26} color="#fff" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #2d3748 100%);
          padding: 2rem;
        }

        .chat-container {
          width: 100%;
          max-width: 1000px;
          height: 90vh;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          position: relative;
          z-index: 1;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }

        .chat-header .back-btn {
          background: #6c63ff;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .chat-header .back-btn:hover {
          background: #5648d1;
          transform: translateY(-1px);
        }

        .chat-header h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 600;
          color: #333;
        }

        .messages {
          flex: 1;
          padding: 2.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          position: relative;
          z-index: 1;
          background: white;
        }

        .message {
          max-width: 75%;
          padding: 2rem 2.5rem;
          border-radius: 25px;
          font-size: 1.4rem;
          line-height: 1.6;
          min-height: 60px;
          display: flex;
          align-items: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .message.user {
          background: linear-gradient(135deg, #6c63ff 0%, #5a4fcf 100%);
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 10px;
          box-shadow: 0 8px 25px rgba(108, 99, 255, 0.3);
        }

        .message.ai {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #2d3748;
          align-self: flex-start;
          border-bottom-left-radius: 10px;
          max-width: 85%;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .message.loading {
          padding: 2rem;
        }

        .typing-indicator {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .typing-indicator span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6c63ff;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        .ai-text {
          white-space: pre-line;
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
          font-weight: 500;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.2rem;
          margin-top: 1.2rem;
          max-height: 450px;
          overflow-y: auto;
          padding: 0.8rem;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          padding: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
          position: relative;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }

        .product-image {
          width: 100%;
          height: 130px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .product-info {
          text-align: left;
        }

        .product-name {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.8rem 0;
          line-height: 1.3;
        }

        .product-price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #6c63ff;
          margin: 0 0 0.8rem 0;
        }

        .stock-status {
          font-size: 0.8rem;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .stock-status.in-stock {
          background: #e8f5e8;
          color: #2d5a2d;
        }

        .stock-status.out-of-stock {
          background: #ffeaea;
          color: #d63031;
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(108, 99, 255, 0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          font-weight: 600;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .more-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 1.2rem;
          background: #f8f9fa;
          border-radius: 8px;
          color: #666;
          font-style: italic;
        }

        .order-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.2rem;
          max-height: 350px;
          overflow-y: auto;
          padding: 0.8rem;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 1.2rem;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;
          color: #6c63ff;
          font-weight: 600;
        }

        .order-details {
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .order-details p {
          margin: 0.4rem 0;
        }

        .suggestions-container {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding: 2rem;
          overflow-x: auto;
          background: white;
          position: relative;
          z-index: 1;
        }

        .suggestion-box {
          background: linear-gradient(135deg, #e0e3f8 0%, #d4d8f0 100%);
          border: 2px solid rgba(108, 99, 255, 0.2);
          border-radius: 25px;
          padding: 1.2rem 2rem;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
          color: #2d3748;
          font-weight: 600;
          min-height: 50px;
          display: flex;
          align-items: center;
          box-shadow: 0 6px 15px rgba(108, 99, 255, 0.15);
        }

        .suggestion-box:hover:not(:disabled) {
          background: linear-gradient(135deg, #6c63ff 0%, #5a4fcf 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(108, 99, 255, 0.4);
          border-color: #6c63ff;
        }

        .suggestion-box:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-box {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          border-top: 1px solid #e2e8f0;
          background: white;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
        }

        .input-box input {
          flex: 1;
          border: 2px solid #e0e3f8;
          outline: none;
          padding: 1.5rem 2rem;
          font-size: 1.2rem;
          border-radius: 35px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #2d3748;
          text-transform: none;
          min-height: 60px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .input-box input:focus {
          border-color: #6c63ff;
          box-shadow: 0 6px 20px rgba(108, 99, 255, 0.2);
          background: white;
        }

        .input-box input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-box button {
          background: linear-gradient(135deg, #6c63ff 0%, #5a4fcf 100%);
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(108, 99, 255, 0.3);
        }

        .input-box button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5a4fcf 0%, #4c46d6 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(108, 99, 255, 0.4);
        }

        .input-box button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .chat-wrapper {
            padding: 0.5rem;
            height: 100vh;
          }
          
          .chat-container {
            height: 100vh;
            border-radius: 0;
            max-width: 100%;
          }
          
          .chat-header {
            padding: 1rem 1.2rem;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          }
          
          .chat-header .back-btn {
            width: 40px;
            height: 40px;
          }
          
          .chat-header h2 {
            font-size: 1.3rem;
          }
          
          .messages {
            padding: 1rem;
            gap: 1.5rem;
          }
          
          .message {
            max-width: 85%;
            padding: 1rem 1.5rem;
            font-size: 0.95rem;
            min-height: 40px;
            border-radius: 18px;
            line-height: 1.5;
          }
          
          .message.user {
            border-bottom-right-radius: 6px;
          }
          
          .message.ai {
            border-bottom-left-radius: 6px;
            max-width: 90%;
          }
          
          .ai-text {
            font-size: 0.95rem;
            margin-bottom: 1rem;
          }
          
          .product-list {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 0.8rem;
            padding: 0.5rem;
            max-height: 300px;
          }
          
          .product-card {
            padding: 0.8rem;
          }
          
          .product-image {
            height: 80px;
            margin-bottom: 0.5rem;
          }
          
          .product-name {
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
          }
          
          .product-price {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }
          
          .stock-status {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }
          
          .order-card {
            padding: 0.8rem;
          }
          
          .order-details {
            font-size: 0.8rem;
          }
          
          .suggestions-container {
            padding: 0.8rem 1rem;
            gap: 0.8rem;
          }
          
          .suggestion-box {
            padding: 0.8rem 1.2rem;
            font-size: 0.85rem;
            min-height: 40px;
            border-radius: 20px;
          }
          
          .input-box {
            padding: 1rem;
            gap: 0.8rem;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
          
          .input-box input {
            font-size: 0.95rem;
            padding: 1rem 1.5rem;
            min-height: 45px;
            border-radius: 25px;
          }
          
          .input-box button {
            width: 45px;
            height: 45px;
          }
          
          .input-box button svg {
            width: 20px;
            height: 20px;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .messages {
            padding: 0.8rem;
          }
          
          .message {
            padding: 0.8rem 1.2rem;
            font-size: 0.9rem;
          }
          
          .ai-text {
            font-size: 0.9rem;
          }
          
          .product-list {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .suggestions-container {
            padding: 0.6rem 0.8rem;
            gap: 0.6rem;
          }
          
          .suggestion-box {
            padding: 0.6rem 1rem;
            font-size: 0.8rem;
            min-height: 35px;
          }
          
          .input-box {
            padding: 0.8rem;
          }
          
          .input-box input {
            font-size: 0.9rem;
            padding: 0.8rem 1.2rem;
            min-height: 40px;
          }
          
          .input-box button {
            width: 40px;
            height: 40px;
          }
          
          .input-box button svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;