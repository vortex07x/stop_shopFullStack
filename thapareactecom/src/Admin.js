// src/pages/Admin.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { AdminProvider } from "./context/AdminContext";

// Import the separate admin components with correct paths
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminOrders from "./components/admin/AdminOrders";
import AdminSidebar from "./components/admin/AdminSidebar";
import AdminAnalysis from "./components/admin/AdminAnalysis";

const AdminContent = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const userRole = localStorage.getItem("userRole") || "";
  const userName = localStorage.getItem("userName") || "Admin";
  const userEmail = localStorage.getItem("userEmail") || "";
  const token = localStorage.getItem("token");
  const isAdmin = userRole.toUpperCase() === 'ADMIN';

  // Redirect non-admin users
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/404");
      return;
    }
  }, [navigate, token, isAdmin]);

  if (!token || !isAdmin) {
    return null; // This will be handled by useEffect redirect
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard setActiveSection={setActiveSection} />;
      case 'users':
        return <AdminUsers />;
      case 'orders':
        return <AdminOrders />;
      case 'analysis':
        return <AdminAnalysis />;
      case 'products':
        // Placeholder for now, you can create AdminProducts component later
        return renderProducts();
      default:
        return <AdminDashboard setActiveSection={setActiveSection} />;
    }
  };

  // Temporary placeholder for products section (using your existing code)
  const renderProducts = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Product Management</h2>
        <p>Manage your product catalog and inventory</p>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h3>Product Details Section</h3>
        <p>This section will display product information including:</p>
        <ul>
          <li>Product listings and details</li>
          <li>Inventory management</li>
          <li>Product categories and tags</li>
          <li>Pricing and discount management</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Wrapper>
      <div className="admin-layout">
        {/* Left Sidebar Navigation */}
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main Content Area */}
        <div className="main-content">
          {/* Header */}
          <div className="content-header">
            <div className="header-info">
              <h1>Admin Dashboard</h1>
              <div className="admin-info">
                <p>Welcome back, <strong>{userName}</strong></p>
                <p className="admin-email">{userEmail}</p>
              </div>
            </div>
            <div className="header-actions">
              <Link to="/profile" className="back-to-profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Profile
              </Link>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="content-body">
            {renderContent()}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

// Main Admin component with context provider
const Admin = () => {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
};

export default Admin;

// Animations (keeping your existing animations)
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Wrapper = styled.section`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;

  .admin-layout {
    display: flex;
    width: 100%;
    height: 100vh;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .content-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2rem 3rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-info {
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 0.5rem 0;
        animation: ${fadeIn} 0.6s ease-out;
      }

      .admin-info {
        p {
          margin: 0.25rem 0;
          color: #4a5568;
          font-size: 0.95rem;
          
          strong {
            color: #2d3748;
            font-weight: 600;
          }
        }

        .admin-email {
          color: #718096;
          font-size: 0.875rem;
        }
      }
    }

    .header-actions {
      .back-to-profile {
        background: rgba(255, 255, 255, 0.9);
        color: #4a5568;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 1);
          border-color: #cbd5e0;
          color: #2d3748;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .content-body {
    flex: 1;
    padding: 2rem 3rem;
    overflow-y: auto;
    animation: ${slideIn} 0.6s ease-out;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }

  /* Section Content */
  .section-content {
    .section-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);

      h2 {
        color: #1a202c;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
      }

      p {
        color: #718096;
        font-size: 1rem;
        margin: 0;
        line-height: 1.5;
      }
    }

    .placeholder-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);

      .placeholder-icon {
        color: #cbd5e0;
        margin-bottom: 1.5rem;
        animation: ${float} 3s ease-in-out infinite;
      }

      h3 {
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      p {
        color: #718096;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      ul {
        text-align: left;
        max-width: 400px;
        margin: 0 auto;
        color: #4a5568;

        li {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
          position: relative;
          font-size: 1rem;
          line-height: 1.5;

          &::before {
            content: "•";
            color: #4299e1;
            position: absolute;
            left: 0;
            font-weight: bold;
            font-size: 1.2rem;
          }
        }
      }
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .admin-layout {
      flex-direction: column;
      height: auto;
      min-height: 100vh;
    }

    .main-content {
      background: rgba(255, 255, 255, 0.05);
    }

    .content-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;

      .header-info h1 {
        font-size: 1.5rem;
      }

      .header-actions {
        width: 100%;
        
        .back-to-profile {
          width: 100%;
          justify-content: center;
          padding: 1rem 1.5rem;
        }
      }
    }

    .content-body {
      padding: 1.5rem;
      padding-bottom: 140px; /* Space for mobile sidebar */
    }

    .section-content {
      .section-header {
        padding: 1.5rem;
        border-radius: 12px;
        
        h2 {
          font-size: 1.25rem;
        }
        
        p {
          font-size: 0.9rem;
        }
      }

      .placeholder-content {
        padding: 2rem;
        border-radius: 12px;
        
        h3 {
          font-size: 1.25rem;
        }
        
        p, li {
          font-size: 0.9rem;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .content-header {
      padding: 1rem;
      
      .header-info h1 {
        font-size: 1.25rem;
      }
    }

    .content-body {
      padding: 1rem;
      padding-bottom: 140px;
    }

    .section-content {
      .section-header {
        padding: 1rem;
      }

      .placeholder-content {
        padding: 1.5rem;
      }
    }
  }
`;