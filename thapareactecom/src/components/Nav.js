// src/components/Nav.js
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiShoppingCart } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { CgMenu, CgClose } from "react-icons/cg";
import { useCartContext } from "../context/cart_context";
import { Button } from "../styles/Button";
import AuthForm from "./AuthForm";

const Nav = () => {
  const [menuIcon, setMenuIcon] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    avatar: ''
  });
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  
  const { total_items } = useCartContext();

  // Show toast notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Clear notifications after timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const isValidToken = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  const clearUserData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    setIsLoggedIn(false);
    setUserProfile({ name: '', avatar: '' });
    
    showNotification("Your session has expired. Please log in again.", 'warning');
    
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    window.dispatchEvent(new Event("storage"));
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsLoggedIn(false);
      setUserProfile({ name: '', avatar: '' });
      return false;
    }
    
    if (!isValidToken(token)) {
      clearUserData();
      return false;
    }
    
    setIsLoggedIn(true);
    updateUserProfile();
    return true;
  };

  const truncateUsername = (name) => {
    if (!name) return '';
    return name.length > 10 ? name.substring(0, 10) + '...' : name;
  };

  const getDisplayName = () => {
    if (userProfile.name && userProfile.name.trim() !== "") {
      return userProfile.name;
    }
    
    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim() !== "") {
      return storedName;
    }
    
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail && userEmail.trim() !== "") {
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
        
        return processedName || emailName;
      }
    }
    
    return "User";
  };

  const getAvatarUrl = () => {
    if (userProfile.avatar && userProfile.avatar.trim() !== "") {
      return userProfile.avatar;
    }
    
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedAvatar && storedAvatar.trim() !== "") {
      return storedAvatar;
    }
    
    return null;
  };

  const updateUserProfile = () => {
    const name = getDisplayName();
    const avatar = getAvatarUrl();
    setUserProfile({ name, avatar });
  };

  useEffect(() => {
    checkAuthStatus();
    
    const tokenValidationInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && !isValidToken(token)) {
        clearUserData();
      }
    }, 30000);

    return () => clearInterval(tokenValidationInterval);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === null) {
        checkAuthStatus();
      }
    };

    const handleAvatarUpdate = () => {
      if (isLoggedIn) {
        updateUserProfile();
      }
    };

    const handleProfileUpdate = () => {
      if (isLoggedIn) {
        updateUserProfile();
      }
    };

    const handleUserLoggedIn = () => {
      checkAuthStatus();
    };

    const handleUserLoggedOut = () => {
      setIsLoggedIn(false);
      setUserProfile({ name: '', avatar: '' });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("userLoggedIn", handleUserLoggedIn);
    window.addEventListener("userLoggedOut", handleUserLoggedOut);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("userLoggedIn", handleUserLoggedIn);
      window.removeEventListener("userLoggedOut", handleUserLoggedOut);
    };
  }, [isLoggedIn]);

  return (
    <Navbar>
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-content">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="toast-close">×</button>
          </div>
        </div>
      )}

      <div className={menuIcon ? "navbar active" : "navbar"}>
        <ul className="navbar-lists">
          <li>
            <NavLink
              to="/"
              className="navbar-link"
              onClick={() => setMenuIcon(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className="navbar-link"
              onClick={() => setMenuIcon(false)}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              className="navbar-link"
              onClick={() => setMenuIcon(false)}
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="navbar-link"
              onClick={() => setMenuIcon(false)}
            >
              Contact
            </NavLink>
          </li>

          {!isLoggedIn && (
            <li>
              <Button onClick={() => setShowAuthForm(true)}>Log In</Button>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <NavLink to="/profile" className="profile-section" onClick={() => setMenuIcon(false)}>
                <span className="username">{truncateUsername(userProfile.name)}</span>
                <div className="avatar-container">
                  {userProfile.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt="Profile" 
                      className="profile-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <FaUserCircle 
                    className={`profile-icon ${userProfile.avatar ? 'hidden' : ''}`}
                  />
                </div>
              </NavLink>
            </li>
          )}

          <li>
            <NavLink to="/cart" className="navbar-link cart-trolley--link">
              <FiShoppingCart className="cart-trolley" />
              <span className="cart-total--item"> {total_items} </span>
            </NavLink>
          </li>
        </ul>

        {/* Mobile menu toggle */}
        <div className="mobile-navbar-btn">
          <CgMenu
            name="menu-outline"
            className="mobile-nav-icon"
            onClick={() => setMenuIcon(true)}
          />
          <CgClose
            name="close-outline"
            className="mobile-nav-icon close-outline"
            onClick={() => setMenuIcon(false)}
          />
        </div>
      </div>

      {showAuthForm && (
        <AuthForm
          onClose={() => {
            setShowAuthForm(false);
          }}
        />
      )}
    </Navbar>
  );
};

export default Nav;

const Navbar = styled.nav`
  /* Toast Notification Styles */
  .toast-notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 10000;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    animation: slideInFromRight 0.4s ease-out;
    max-width: 400px;

    &.info {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
    }

    &.warning {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
      color: white;
    }

    &.error {
      background: linear-gradient(135deg, #f56565, #e53e3e);
      color: white;
    }

    .toast-content {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;

      span {
        flex: 1;
        font-weight: 500;
      }

      .toast-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Desktop Navigation */
  .navbar-lists {
    display: flex;
    gap: 4rem;
    align-items: center;

    .navbar-link {
      &:link,
      &:visited {
        display: inline-block;
        text-decoration: none;
        font-size: 1.7rem;
        font-weight: 500;
        text-transform: uppercase;
        color: ${({ theme }) => theme.colors.text};
        transition: color 0.3s ease;
      }

      &:hover,
      &:active {
        color: ${({ theme }) => theme.colors.helper};
      }
    }
  }

  .mobile-navbar-btn {
    display: none;
    background-color: transparent;
    cursor: pointer;
    border: none;
  }

  .cart-trolley--link {
    position: relative;

    .cart-trolley {
      font-size: 3rem;
    }

    .cart-total--item {
      width: 2.2rem;
      height: 2.2rem;
      position: absolute;
      background-color: ${({ theme }) => theme.colors.helper};
      color: #fff;
      font-size: 1.2rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      top: -20%;
      left: 70%;
      font-weight: bold;
    }
  }

  .profile-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1.4rem;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 2.5rem;
    transition: all 0.3s ease;
    text-decoration: none !important;
    border: 2px solid transparent;

    &:hover {
      background: linear-gradient(135deg, #e9ecef, #dee2e6);
      border-color: ${({ theme }) => theme.colors.helper};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .username {
      font-size: 1.4rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      text-transform: none;
      white-space: nowrap;
      margin: 0;
    }

    .avatar-container {
      position: relative;
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border: 2px solid #ddd;

      .profile-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      .profile-icon {
        font-size: 2.4rem;
        color: ${({ theme }) => theme.colors.text};

        &.hidden {
          display: none;
        }
      }
    }
  }

  /* Mobile Navigation */
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .toast-notification {
      right: 1rem;
      left: 1rem;
      top: 1rem;
    }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 1rem 2rem;
      position: relative;
    }

    .mobile-navbar-btn {
      display: block;
      z-index: 1001;

      .mobile-nav-icon {
        font-size: 3rem;
        color: ${({ theme }) => theme.colors.text};
        transition: all 0.3s ease;

        &.close-outline {
          display: none;
        }
      }
    }

    .navbar.active .mobile-navbar-btn {
      .mobile-nav-icon {
        display: none;

        &.close-outline {
          display: block;
        }
      }
    }

    .navbar-lists {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${({ theme }) => theme.colors.bg};
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 3rem;
      
      transform: translateX(100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease-in-out;
      z-index: 1000;

      li {
        margin: 0;
      }

      .navbar-link {
        font-size: 3rem !important;
        font-weight: 600;
        padding: 1rem 2rem;
        border-radius: 10px;
        transition: all 0.3s ease;
        text-align: center;
        display: block;

        &:hover {
          background: rgba(0, 123, 255, 0.1);
          color: ${({ theme }) => theme.colors.helper};
        }
      }

      .profile-section {
        padding: 1.5rem 2.5rem;
        gap: 1.5rem;
        border-radius: 25px;

        .username {
          font-size: 2.4rem;
          font-weight: 700;
        }

        .avatar-container {
          width: 4.5rem;
          height: 4.5rem;

          .profile-icon {
            font-size: 3.5rem;
          }
        }
      }

      .cart-trolley--link {
        padding: 1.5rem;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .cart-trolley {
          font-size: 4rem !important;
        }

        .cart-total--item {
          width: 3rem !important;
          height: 3rem !important;
          font-size: 1.6rem !important;
          top: -10px;
          right: -10px;
          left: auto;
        }
      }

      li button {
        font-size: 2.4rem;
        padding: 1.5rem 3rem;
        border-radius: 15px;
      }
    }

    .navbar.active .navbar-lists {
      transform: translateX(0);
      opacity: 1;
      visibility: visible;
    }
  }

  @media (max-width: 480px) {
    .navbar {
      padding: 1rem 1.5rem;
    }

    .mobile-navbar-btn .mobile-nav-icon {
      font-size: 2.5rem;
    }

    .navbar-lists {
      gap: 2.5rem;

      .navbar-link {
        font-size: 2.5rem !important;
        padding: 0.8rem 1.5rem;
      }

      .profile-section {
        padding: 1.2rem 2rem;
        gap: 1rem;

        .username {
          font-size: 2rem;
        }

        .avatar-container {
          width: 3.5rem;
          height: 3.5rem;

          .profile-icon {
            font-size: 2.8rem;
          }
        }
      }

      .cart-trolley--link {
        padding: 1.2rem;

        .cart-trolley {
          font-size: 3.5rem !important;
        }

        .cart-total--item {
          width: 2.5rem !important;
          height: 2.5rem !important;
          font-size: 1.4rem !important;
        }
      }

      li button {
        font-size: 2rem;
        padding: 1.2rem 2.5rem;
      }
    }
  }
`;