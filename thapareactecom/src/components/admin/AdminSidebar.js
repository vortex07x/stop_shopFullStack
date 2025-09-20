// src/components/admin/AdminSidebar.js
import React from "react";
import styled, { keyframes } from "styled-components";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 'users',
      label: 'User Details',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 'orders',
      label: 'User Orders',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 'analysis',
      label: 'Analytics',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <SidebarWrapper>
      <div className="sidebar-header">
        <div className="admin-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9 5.16.74 9-3.45 9-9V7l-9-5z" fill="currentColor"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div className="admin-text">ADMIN</div>
      </div>
      
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            data-tooltip={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </SidebarWrapper>
  );
};

export default AdminSidebar;

const pulseGlow = keyframes`
  0% { box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
  100% { box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3); }
`;

const SidebarWrapper = styled.div`
  width: 80px;
  background: #ffffff;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  transition: width 0.2s ease;
  position: relative;
  z-index: 100;
  overflow: visible;

  .sidebar-header {
    padding: 1.5rem 0;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-badge {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    padding: 0.875rem;
    border-radius: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .admin-text {
    display: none;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: visible;
  }

  .nav-item {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    position: relative;
    text-align: center;
    margin: 0.25rem 0;
    border-radius: 0.75rem;
    outline: none;

    &:hover,
    &:focus-visible {
      background: #f3f4f6;
      color: #111827;
      transform: scale(1.05);
    }

    &:hover::after,
    &:focus-visible::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      background: #1f2937;
      color: white;
      padding: 0.5rem 0.875rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      opacity: 1;
      visibility: visible;
      animation: tooltipFadeIn 0.15s ease;
      pointer-events: none;
    }

    &:hover::before,
    &:focus-visible::before {
      content: '';
      position: absolute;
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 6px 6px 6px 0;
      border-color: transparent #1f2937 transparent transparent;
      z-index: 1000;
      opacity: 1;
      visibility: visible;
      pointer-events: none;
    }

    &:focus-visible {
      outline: 2px solid #93c5fd;
      outline-offset: 2px;
    }

    &.active {
      background: #eff6ff;
      color: #2563eb;
      border-left-color: #3b82f6;

      .nav-icon {
        color: #3b82f6;
      }

      &:hover,
      &:focus-visible {
        background: #dbeafe;
      }
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      transition: all 0.2s ease;

      svg {
        width: 30px;
        height: 30px;
      }
    }

    .nav-label {
      display: none;
    }
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateX(-8px) translateY(-50%);
    }
    to {
      opacity: 1;
      transform: translateX(0) translateY(-50%);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    flex-direction: row;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    border-right: none;
    border-top: 1px solid #e5e7eb;

    .sidebar-header {
      display: none;
    }

    .sidebar-nav {
      padding: 0.5rem 0;
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-around;
      align-items: center;
    }

    .nav-item {
      width: auto;
      height: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      border-left: none;
      border-top: 3px solid transparent;
      border-radius: 0;
      margin: 0;

      &::after,
      &::before {
        display: none !important;
      }

      &:hover {
        transform: none;
        background: #f3f4f6;
      }

      &.active {
        border-left: none;
        border-top-color: #3b82f6;
        background: #eff6ff;
      }

      .nav-label {
        display: block !important;
        font-size: 0.75rem;
        margin-left: 0;
        opacity: 1 !important;
        line-height: 1;
      }

      .nav-icon svg {
        width: 22px;
        height: 22px;
      }
    }

    .admin-text {
      display: none !important;
    }
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    .nav-item {
      width: 48px;
      height: 48px;

      .nav-icon svg {
        width: 26px;
        height: 26px;
      }
    }
  }
`;