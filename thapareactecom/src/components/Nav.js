// src/components/Nav.js
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { FiShoppingCart } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa"; // ✅ Profile icon
import { CgMenu, CgClose } from "react-icons/cg";
import { useCartContext } from "../context/cart_context";
import { Button } from "../styles/Button";
import AuthForm from "./AuthForm"; // ✅ Login/Register popup

const Nav = () => {
  const [menuIcon, setMenuIcon] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ Track login state
  const [userProfile, setUserProfile] = useState({
    name: '',
    avatar: ''
  });
  
  // FIXED: Changed from total_item to total_items to match cart context state
  const { total_items } = useCartContext();

  // Function to truncate username to 10 characters
  const truncateUsername = (name) => {
    if (!name) return '';
    return name.length > 10 ? name.substring(0, 10) + '...' : name;
  };

  // Function to get display name from localStorage or profile
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
        
        return processedName || emailName;
      }
    }
    
    return "User";
  };

  // Function to get avatar URL
  const getAvatarUrl = () => {
    if (userProfile.avatar && userProfile.avatar.trim() !== "") {
      return userProfile.avatar;
    }
    
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedAvatar && storedAvatar.trim() !== "") {
      return storedAvatar;
    }
    
    return null; // Will fallback to FaUserCircle icon
  };

  // Function to update user profile data
  const updateUserProfile = () => {
    const name = getDisplayName();
    const avatar = getAvatarUrl();
    setUserProfile({ name, avatar });
  };

  useEffect(() => {
    // ✅ Initial check
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    if (token) {
      updateUserProfile();
    }

    // ✅ Listen for login/logout events (between tabs/windows)
    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("token");
      setIsLoggedIn(!!updatedToken);
      
      if (updatedToken) {
        updateUserProfile();
      } else {
        setUserProfile({ name: '', avatar: '' });
      }
    };

    // ✅ Listen for avatar updates (same page/tab)
    const handleAvatarUpdate = () => {
      if (isLoggedIn) {
        updateUserProfile();
      }
    };

    // ✅ Listen for profile updates (same page/tab)
    const handleProfileUpdate = () => {
      if (isLoggedIn) {
        updateUserProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [isLoggedIn]);

  return (
    <Navbar>
      <div className={menuIcon ? "navbar active" : "navbar"}>
        <ul className="navbar-lists">
          <li>
            <NavLink
              to="/"
              className="navbar-link "
              onClick={() => setMenuIcon(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className="navbar-link "
              onClick={() => setMenuIcon(false)}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              className="navbar-link "
              onClick={() => setMenuIcon(false)}
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="navbar-link "
              onClick={() => setMenuIcon(false)}
            >
              Contact
            </NavLink>
          </li>

          {/* ✅ Show Log In if user is logged out */}
          {!isLoggedIn && (
            <li>
              <Button onClick={() => setShowAuthForm(true)}>Log In</Button>
            </li>
          )}

          {/* ✅ Show Profile section with avatar and username if user is logged in */}
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
                        // Fallback to icon if image fails to load
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

          {/* Cart - FIXED: Changed from total_item to total_items */}
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

      {/* ✅ AuthForm modal - simplified onClose */}
      {showAuthForm && (
        <AuthForm
          onClose={() => {
            setShowAuthForm(false);
            // ✅ The AuthForm now handles all login events automatically
          }}
        />
      )}
    </Navbar>
  );
};

export default Nav;

// ✅ styled-components with new profile section styles
const Navbar = styled.nav`
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

  .profile-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
    font-size: 2.4rem;
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.helper};
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

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .mobile-navbar-btn {
      display: inline-block;
      z-index: 9999;

      .mobile-nav-icon {
        font-size: 4rem;
        color: ${({ theme }) => theme.colors.text};
      }
    }

    .navbar-lists {
      width: 100vw;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
      background-color: ${({ theme }) => theme.colors.bg};
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      visibility: hidden;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-in-out;
    }

    .active .navbar-lists {
      visibility: visible;
      opacity: 1;
      transform: translateX(0);
      z-index: 999;

      .navbar-link {
        font-size: 3rem;
      }
    }

    .cart-trolley {
      font-size: 4rem !important;
    }

    .cart-total--item {
      width: 3rem !important;
      height: 3rem !important;
      font-size: 1.6rem !important;
    }

    .profile-section {
      padding: 1.2rem 2rem;
      gap: 1.5rem;

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
  }
`;