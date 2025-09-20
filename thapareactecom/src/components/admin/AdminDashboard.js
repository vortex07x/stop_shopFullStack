// src/components/admin/AdminDashboard.js
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useAdmin } from "../../context/AdminContext";

const AdminDashboard = ({ setActiveSection }) => {
  const { 
    stats, 
    loading, 
    error, 
    fetchAdminStats, 
    clearError 
  } = useAdmin();

  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch total products from API
  const fetchTotalProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("https://api.pujakaitem.com/api/products");
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setTotalProducts(data.length);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setTotalProducts(0);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchTotalProducts();
  }, []);

  // Clear errors after a timeout
  useEffect(() => {
    if (error.stats) {
      const timer = setTimeout(() => {
        clearError('stats');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error.stats, clearError]);

  // Calculate dummy revenue based on orders and average order value
  const calculateRevenue = () => {
    if (stats.totalOrders > 0) {
      // Assuming average order value between ₹500 to ₹2000
      const avgOrderValue = 1250;
      return stats.totalOrders * avgOrderValue;
    }
    return 0;
  };

  const revenue = calculateRevenue();

  // Handle navigation to different sections
  const handleNavigation = (section) => {
    if (setActiveSection) {
      setActiveSection(section);
    }
  };

  return (
    <DashboardWrapper>
      {/* Error Display */}
      {error.stats && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Failed to load stats: {error.stats}</span>
            <button onClick={() => clearError('stats')} className="error-close">×</button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {loading.stats ? <div className="loading-skeleton"></div> : stats.totalUsers || 0}
            </div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {isLoadingProducts ? <div className="loading-skeleton"></div> : totalProducts}
            </div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {loading.stats ? <div className="loading-skeleton"></div> : stats.totalOrders || 0}
            </div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {loading.stats ? <div className="loading-skeleton"></div> : `₹${revenue.toLocaleString()}`}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button 
          className={`refresh-btn ${loading.stats || isLoadingProducts ? 'loading' : ''}`}
          onClick={() => {
            fetchAdminStats();
            fetchTotalProducts();
          }}
          disabled={loading.stats || isLoadingProducts}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {(loading.stats || isLoadingProducts) ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Quick Actions with Navigation */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <div 
            className="action-card"
            onClick={() => handleNavigation('users')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('users');
              }
            }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Manage Users</h4>
              <p>View and manage registered users</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div 
            className="action-card"
            onClick={() => handleNavigation('orders')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('orders');
              }
            }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>View Orders</h4>
              <p>Monitor and process customer orders</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div 
            className="action-card"
            onClick={() => handleNavigation('products')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('products');
              }
            }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Product Catalog</h4>
              <p>Manage products and inventory</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div 
            className="action-card"
            onClick={() => handleNavigation('analysis')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigation('analysis');
              }
            }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Analytics</h4>
              <p>View detailed reports and insights</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Notice */}
      <div className="coming-soon">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>Enhanced Analytics Dashboard</h3>
          <p>Access comprehensive business analytics with interactive charts, real-time data visualization, and detailed insights. Click on the Analytics card above or use the sidebar to explore advanced reporting features with real product data.</p>
          <button 
            className="cta-button"
            onClick={() => handleNavigation('analysis')}
          >
            Explore Analytics
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default AdminDashboard;

// Animations
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const cardHover = keyframes`
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-8px) scale(1.02); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const DashboardWrapper = styled.div`
  /* Error Banner */
  .error-banner {
    background: rgba(245, 101, 101, 0.1);
    border: 1px solid rgba(245, 101, 101, 0.2);
    border-radius: 12px;
    margin-bottom: 2rem;
    animation: ${slideIn} 0.3s ease-out;

    .error-content {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #c53030;

      svg {
        flex-shrink: 0;
      }

      span {
        flex: 1;
        font-weight: 500;
      }

      .error-close {
        background: none;
        border: none;
        color: #c53030;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(245, 101, 101, 0.1);
        }
      }
    }
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.6s;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

        &::before {
          left: 100%;
        }
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: transform 0.3s ease;
      }

      &.users .stat-icon {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }

      &.products .stat-icon {
        background: linear-gradient(135deg, #f093fb, #f5576c);
      }

      &.orders .stat-icon {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
      }

      &.revenue .stat-icon {
        background: linear-gradient(135deg, #43e97b, #38f9d7);
      }

      &:hover .stat-icon {
        transform: scale(1.1) rotate(5deg);
      }

      .stat-content {
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;

          .loading-skeleton {
            width: 80px;
            height: 32px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: ${shimmer} 1.5s infinite;
            border-radius: 8px;
          }
        }

        .stat-label {
          color: #718096;
          font-weight: 600;
          font-size: 1rem;
        }
      }
    }
  }

  /* Refresh Section */
  .refresh-section {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;

    .refresh-btn {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(66, 153, 225, 0.4);
        background: linear-gradient(135deg, #3182ce, #2c5282);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      &.loading svg {
        animation: ${spin} 1s linear infinite;
      }
    }
  }

  /* Quick Actions */
  .quick-actions {
    margin-bottom: 3rem;

    h3 {
      color: #2d3748;
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;

      .action-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        cursor: pointer;
        border: 2px solid transparent;
        position: relative;

        &:hover {
          animation: ${cardHover} 0.3s ease forwards;
          border-color: #4299e1;
          box-shadow: 0 8px 30px rgba(66, 153, 225, 0.2);
        }

        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.1);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #4299e1, #3182ce);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        &:hover .action-icon {
          transform: scale(1.1);
        }

        .action-content {
          flex: 1;
          
          h4 {
            color: #2d3748;
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.25rem 0;
          }

          p {
            color: #718096;
            font-size: 0.9rem;
            margin: 0;
            line-height: 1.4;
          }
        }

        .action-arrow {
          color: #cbd5e0;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        &:hover .action-arrow {
          color: #4299e1;
          transform: translateX(4px);
        }
      }
    }
  }

  /* Coming Soon Section */
  .coming-soon {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 3rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    text-align: center;

    .coming-soon-content {
      max-width: 600px;
      margin: 0 auto;

      .coming-soon-icon {
        color: #4299e1;
        margin-bottom: 1.5rem;
        animation: ${float} 3s ease-in-out infinite;
      }

      h3 {
        color: #2d3748;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      p {
        color: #718096;
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 0 0 2rem 0;
      }

      .cta-button {
        background: linear-gradient(135deg, #4299e1, #3182ce);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(66, 153, 225, 0.4);
          background: linear-gradient(135deg, #3182ce, #2c5282);
        }

        svg {
          transition: transform 0.3s ease;
        }

        &:hover svg {
          transform: translateX(4px);
        }
      }
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    margin-bottom: 120px; /* Space for mobile sidebar */

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 1rem;

      .stat-card {
        padding: 1.5rem;
        
        .stat-icon {
          width: 50px;
          height: 50px;
        }
        
        .stat-content .stat-number {
          font-size: 1.5rem;
        }
      }
    }

    .quick-actions {
      .actions-grid {
        grid-template-columns: 1fr;
        gap: 1rem;

        .action-card {
          padding: 1.2rem;
        }
      }
    }

    .coming-soon {
      padding: 2rem;

      .coming-soon-content h3 {
        font-size: 1.5rem;
      }
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      .stat-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
    }

    .coming-soon {
      padding: 1.5rem;

      .coming-soon-content {
        p {
          font-size: 1rem;
        }
      }
    }
  }
`;