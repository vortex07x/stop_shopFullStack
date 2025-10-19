// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const Profile = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState('');
  const [shuffling, setShuffling] = useState(false);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    itemsInCart: 0
  });
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  // Get user info from localStorage
  const userEmail = localStorage.getItem("userEmail") || "";
  const userRole = localStorage.getItem("userRole") || "";
  const token = localStorage.getItem("token");
  
  // Check if user is admin
  const isAdmin = userRole.toUpperCase() === 'ADMIN';
  
  // Create a display name from localStorage or profile data
  const getDisplayName = () => {
    if (userProfile.name && userProfile.name.trim() !== "") {
      return userProfile.name;
    }
    
    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim() !== "") {
      return storedName;
    }
    
    if (userEmail && userEmail.trim() !== "") {
      // Convert email to a readable name (e.g., "john.doe@email.com" -> "John Doe")
      const emailName = userEmail.split("@")[0];
      
      if (emailName && emailName.length > 0) {
        const processedName = emailName
          .split(/[._-]/)
          .map(word => {
            if (word && word.length > 0) {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return "";
          })
          .filter(word => word.length > 0)
          .join(" ");
        
        return processedName || emailName; // Fallback to original emailName if processing fails
      }
    }
    
    return "User";
  };
  
  const userName = getDisplayName();

  // Fetch user profile from database
  const fetchUserProfile = async () => {
    try {
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch("https://stopshop-backend.onrender.com/api/user/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const profile = await response.json();
        console.log("User profile fetched:", profile);
        setUserProfile(profile);
        
        // Set avatar from database or generate new one if not exists
        if (profile.avatar && profile.avatar.trim() !== "") {
          setProfilePic(profile.avatar);
          // Also update localStorage for consistency
          localStorage.setItem("userAvatar", profile.avatar);
        } else {
          // If no avatar in database, generate one and save it
          await handleGenerateNewAvatar();
        }
      } else {
        console.log("Failed to fetch user profile:", response.status);
        // Fallback to localStorage avatar if API fails
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedAvatar) {
          setProfilePic(savedAvatar);
        }
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
      // Fallback to localStorage avatar if error
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar) {
        setProfilePic(savedAvatar);
      }
    }
  };

  // Generate new avatar and save to database
  const handleGenerateNewAvatar = async () => {
    try {
      if (!token) {
        console.log("No token found for avatar generation");
        return;
      }

      const response = await fetch("https://stopshop-backend.onrender.com/api/user/avatar/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log("New avatar generated:", result.avatar);
        setProfilePic(result.avatar);
        localStorage.setItem("userAvatar", result.avatar);
        
        // ✅ Dispatch custom event to notify navbar of avatar update
        window.dispatchEvent(new Event("avatarUpdated"));
        
        return result.avatar;
      } else {
        console.log("Failed to generate new avatar:", response.status);
      }
    } catch (error) {
      console.log("Error generating new avatar:", error);
    }
  };

  // Initialize profile data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  // Fetch user statistics from backend
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      
      if (!token || !userEmail) {
        console.log("No token or email found, skipping stats fetch");
        return;
      }

      // Fetch cart items count
      try {
        // Adjust this endpoint based on your actual cart API
        const cartResponse = await fetch("https://stopshop-backend.onrender.com/api/cart/my", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          console.log("Cart data:", cartData);
          
          // Calculate items count - adjust based on your cart response structure
          let itemsCount = 0;
          if (Array.isArray(cartData)) {
            itemsCount = cartData.reduce((total, item) => total + (item.quantity || 1), 0);
          } else if (cartData.items && Array.isArray(cartData.items)) {
            itemsCount = cartData.items.reduce((total, item) => total + (item.quantity || 1), 0);
          } else if (cartData.totalItems) {
            itemsCount = cartData.totalItems;
          }
          
          setUserStats(prev => ({
            ...prev,
            itemsInCart: itemsCount
          }));
        } else {
          console.log("Cart API response not OK:", cartResponse.status);
        }
      } catch (error) {
        console.log("Could not fetch cart stats:", error);
      }

      // Fetch orders data
      try {
        // Adjust this endpoint based on your actual orders API
        const ordersResponse = await fetch("https://stopshop-backend.onrender.com/api/orders/my-orders", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          console.log("Orders data:", ordersData);
          
          let totalOrders = 0;
          let totalSpent = 0;

          // Calculate totals - adjust based on your orders response structure
          if (Array.isArray(ordersData)) {
            totalOrders = ordersData.length;
            totalSpent = ordersData.reduce((sum, order) => {
              const orderTotal = parseFloat(order.total || order.totalAmount || order.amount || 0);
              return sum + orderTotal;
            }, 0);
          } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
            totalOrders = ordersData.orders.length;
            totalSpent = ordersData.orders.reduce((sum, order) => {
              const orderTotal = parseFloat(order.total || order.totalAmount || order.amount || 0);
              return sum + orderTotal;
            }, 0);
          } else if (ordersData.totalOrders !== undefined) {
            totalOrders = ordersData.totalOrders;
            totalSpent = parseFloat(ordersData.totalSpent || 0);
          }

          setUserStats(prev => ({
            ...prev,
            totalOrders,
            totalSpent
          }));
        } else {
          console.log("Orders API response not OK:", ordersResponse.status);
        }
      } catch (error) {
        console.log("Could not fetch order stats:", error);
      }

    } catch (error) {
      console.log("General error fetching stats:", error);
    }
  };

  // Handle avatar shuffle - now saves to database
  const handleShuffleAvatar = async () => {
    setShuffling(true);
    
    try {
      await handleGenerateNewAvatar();
    } catch (error) {
      console.log("Error shuffling avatar:", error);
    }
    
    setTimeout(() => {
      setShuffling(false);
    }, 500);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    navigate("/");
    window.location.reload();
  };

  return (
    <Wrapper>
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-container">
            <img
              src={profilePic}
              alt="Profile"
              className={`profile-pic ${shuffling ? 'shuffling' : ''} ${isAdmin ? 'admin-border' : ''}`}
              onError={(e) => {
                e.target.src = "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg";
              }}
            />
            {isAdmin && (
              <div className="admin-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7v10c0 5.55 3.84 9.74 9 9 5.16.74 9-3.45 9-9V7l-9-5z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
                <span>PREMIUM</span>
              </div>
            )}
            <button 
              className="shuffle-btn" 
              onClick={handleShuffleAvatar}
              disabled={shuffling}
              title="Change Avatar"
            >
              {shuffling ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 18L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12C2 12 7 5 12 5s10 7 10 7-5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>

          <div className="user-info">
            <h2 className="username">
              {userName || "User"}
              {isAdmin && <span className="admin-title">Admin</span>}
            </h2>
            <p className="email">{userProfile.email || userEmail || "No email found"}</p>
          </div>
        </div>

        {/* User Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">{userStats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          {/* <div className="stat-card">
            <div className="stat-number">${userStats.totalSpent.toFixed(2)}</div>
            <div className="stat-label">Total Spent</div>
          </div> */}
          <div className="stat-card">
            <div className="stat-number">{userStats.itemsInCart}</div>
            <div className="stat-label">Items in Cart</div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="profile-actions">
          <Link to="/orders" className="btn my-orders">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
            My Orders
          </Link>
          
          <Link to="/cart" className="btn cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            View Cart
            {userStats.itemsInCart > 0 && (
              <span className="cart-badge">{userStats.itemsInCart}</span>
            )}
          </Link>

          {/* Admin Panel Button - Only show for admin users */}
          {isAdmin && (
            <Link to="/admin" className="btn admin-panel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9 5.16.74 9-3.45 9-9V7l-9-5z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Admin Panel
            </Link>
          )}
          
          <button className="btn logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

export default Profile;

// Animations
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shuffle = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(0.8) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Wrapper = styled.section`
  display: flex;
  justify-content: center;
  padding: 4rem 1rem;
  background: #f9f9f9;
  min-height: 100vh;
  animation: ${fadeIn} 0.6s ease-out;

  .profile-container {
    background: #fff;
    padding: 3.5rem 3rem;
    border-radius: 24px;
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
    max-width: 600px;
    width: 100%;
    text-align: center;
  }

  .profile-header {
    margin-bottom: 3rem;
  }

  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
  }

  .profile-pic {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 5px solid #ddd;
    transition: all 0.3s ease;
    background: #f1f3f5;

    &.admin-border {
      border: 5px solid transparent;
      background: linear-gradient(45deg, #ffd700, #ff6b35, #f7931e, #ffd700) border-box;
      background-clip: padding-box;
      box-shadow: 0 0 0 5px transparent;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        background: linear-gradient(45deg, #ffd700, #ff6b35, #f7931e, #ffd700);
        border-radius: 50%;
        z-index: -1;
        animation: ${shimmer} 2s ease-in-out infinite;
        background-size: 200% 200%;
      }
    }

    &.shuffling {
      animation: ${shuffle} 0.5s ease-in-out;
    }

    &:hover {
      border-color: #007bff;
      transform: scale(1.02);
    }
    
    &.admin-border:hover {
      transform: scale(1.02);
    }
  }

  .admin-badge {
    position: absolute;
    top: -10px;
    left: -10px;
    background: linear-gradient(135deg, #ffd700, #ff6b35);
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    border: 2px solid white;
    
    span {
      font-size: 0.8rem;
      letter-spacing: 0.5px;
    }
  }

  .shuffle-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    border: 3px solid white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);

    &:hover:not(:disabled) {
      background: #0056b3;
      transform: scale(1.1);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    &:disabled svg {
      animation: ${spin} 1s linear infinite;
    }
  }

  .user-info {
    .username {
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0.8rem 0 0.5rem;
      color: #222;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .admin-title {
      background: linear-gradient(135deg, #ffd700, #ff6b35);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }

    .email {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 0;
    }
  }

  .stats-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
    padding: 2rem 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .stat-card {
    text-align: center;
    padding: 1rem;
    border-radius: 12px;
    background: #f1f3f5;
    transition: all 0.3s ease;

    &:hover {
      background: #e0e3e6;
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: #007bff;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1.2rem;
      color: #666;
      font-weight: 500;
    }
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .btn {
    font-size: 1.5rem;
    padding: 1.2rem 1.8rem;
    border-radius: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    text-decoration: none;
    font-weight: 600;
    position: relative;
  }

  .my-orders {
    background: #f1f3f5;
    color: #333;

    &:hover {
      background: #e0e3e6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .cart-btn {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .cart-badge {
      position: absolute;
      top: -5px;
      right: 20px;
      background: #ff4d4d;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
  }

  .admin-panel {
    background: linear-gradient(135deg, #ffd700, #ff6b35);
    color: white;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s;
    }

    &:hover {
      background: linear-gradient(135deg, #ffed4e, #ff8c42);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
      
      &::before {
        left: 100%;
      }
    }
  }

  .logout {
    background: #ff4d4d;
    color: white;

    &:hover {
      background: #e60000;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    padding: 2rem 1rem;

    .profile-container {
      padding: 2.5rem 2rem;
    }

    .profile-pic {
      width: 150px;
      height: 150px;
    }

    .user-info .username {
      font-size: 1.8rem;
      flex-direction: column;
      gap: 8px;
    }

    .admin-title {
      font-size: 0.9rem !important;
      padding: 3px 10px !important;
    }

    .user-info .email {
      font-size: 1.3rem;
    }

    .admin-badge {
      top: -5px;
      left: -5px;
      padding: 6px 10px;
      font-size: 0.8rem;
      
      span {
        font-size: 0.7rem;
      }
    }

    .stats-container {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;

      .stat-number {
        margin-bottom: 0;
      }
    }

    .btn {
      font-size: 1.4rem;
      padding: 1rem 1.5rem;
    }
  }
`;