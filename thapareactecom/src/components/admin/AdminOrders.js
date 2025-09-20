// src/components/admin/AdminOrders.js
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useAdmin } from "../../context/AdminContext";

const AdminOrders = () => {
  const { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    updateOrderStatus, 
    clearError 
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Clear errors after a timeout
  useEffect(() => {
    if (error.orders) {
      const timer = setTimeout(() => {
        clearError('orders');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error.orders, clearError]);

  // Clear notifications after timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus = filterStatus === "all" || order.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ed8936';
      case 'processing':
        return '#4299e1';
      case 'shipped':
        return '#9f7aea';
      case 'delivered':
        return '#48bb78';
      case 'cancelled':
        return '#f56565';
      default:
        return '#718096';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '🕒';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getUserColor = (userId) => {
    // Generate consistent colors for users
    const colors = [
      'rgba(66, 153, 225, 0.1)', // Blue
      'rgba(72, 187, 120, 0.1)', // Green
      'rgba(237, 137, 54, 0.1)',  // Orange
      'rgba(159, 122, 234, 0.1)', // Purple
      'rgba(236, 72, 153, 0.1)',  // Pink
      'rgba(14, 165, 233, 0.1)',  // Sky
      'rgba(34, 197, 94, 0.1)',   // Emerald
      'rgba(251, 146, 60, 0.1)'   // Amber
    ];
    
    return colors[userId % colors.length];
  };

  const getUserBorderColor = (userId) => {
    // Generate consistent border colors for users
    const borderColors = [
      'rgba(66, 153, 225, 0.3)', // Blue
      'rgba(72, 187, 120, 0.3)', // Green
      'rgba(237, 137, 54, 0.3)',  // Orange
      'rgba(159, 122, 234, 0.3)', // Purple
      'rgba(236, 72, 153, 0.3)',  // Pink
      'rgba(14, 165, 233, 0.3)',  // Sky
      'rgba(34, 197, 94, 0.3)',   // Emerald
      'rgba(251, 146, 60, 0.3)'   // Amber
    ];
    
    return borderColors[userId % borderColors.length];
  };

  const handleStatusChange = async (orderId, newStatus, currentStatus) => {
    const updateKey = `${orderId}_${newStatus}`;
    setStatusUpdateLoading(prev => ({ ...prev, [updateKey]: true }));
    
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        // Show enhanced success notification
        const statusEmoji = getStatusIcon(newStatus);
        const customerName = orders.find(order => order.id === orderId)?.userName || 'Customer';
        showNotification(
          `${statusEmoji} Order #${orderId} status updated to "${newStatus.toUpperCase()}"! ${customerName} has been notified via email.`,
          'success'
        );
      } else {
        showNotification(result.message || 'Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification("Error updating order status: " + error.message, 'error');
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  return (
    <OrdersWrapper>
      <div className="section-header">
        <div className="header-content">
          <h2>Order Management</h2>
          <p>Monitor and manage all customer orders</p>
        </div>
        
        {/* Refresh Button */}
        <button 
          className={`refresh-btn ${loading.orders ? 'loading' : ''}`}
          onClick={fetchOrders}
          disabled={loading.orders}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {loading.orders ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <div className="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {notification.type === 'success' ? (
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              ) : (
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2"/>
              )}
            </svg>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="notification-close">×</button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error.orders && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Failed to load orders: {error.orders}</span>
            <button onClick={() => clearError('orders')} className="error-close">×</button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">🕒 Pending</option>
            <option value="processing">⚙️ Processing</option>
            <option value="shipped">🚚 Shipped</option>
            <option value="delivered">✅ Delivered</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading.orders ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : currentOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Orders Found</h3>
            <p>No orders match your current search criteria.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className={`order-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                    style={{
                      backgroundColor: getUserColor(order.userId),
                      borderLeft: `4px solid ${getUserBorderColor(order.userId)}`
                    }}
                  >
                    <td className="order-id">#{order.id}</td>
                    <td className="customer-info">
                      <div className="customer-details">
                        <div className="customer-name">{order.userName}</div>
                        <div className="customer-email">{order.userEmail}</div>
                      </div>
                    </td>
                    <td className="amount-cell">
                      <span className="amount">₹{order.totalAmount.toFixed(2)}</span>
                    </td>
                    <td>
                      <div className="status-container">
                        <span className="status-badge" style={{ color: getStatusColor(order.status) }}>
                          <div className="status-dot" style={{ backgroundColor: getStatusColor(order.status) }}></div>
                          <span className="status-icon">{getStatusIcon(order.status)}</span>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="date-cell">{formatDate(order.createdAt)}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View Order Details"
                          onClick={() => handleViewOrder(order)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        
                        <select
                          className={`status-select ${statusUpdateLoading[`${order.id}_${order.status}`] ? 'loading' : ''}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
                          title="Update Status - Customer will be notified via email"
                          disabled={Object.values(statusUpdateLoading).some(loading => loading)}
                        >
                          <option value="pending">🕒 Pending</option>
                          <option value="processing">⚙️ Processing</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`page-number ${currentPage === number ? 'active' : ''}`}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={closeOrderDetails}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="order-info-grid">
                <div className="info-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.userName}</p>
                  <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                  <p><strong>Customer ID:</strong> #{selectedOrder.userId}</p>
                </div>
                
                <div className="info-section">
                  <h4>Order Information</h4>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span className="status-badge" style={{ color: getStatusColor(selectedOrder.status) }}>
                      <span className="status-icon">{getStatusIcon(selectedOrder.status)}</span>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p><strong>Total Amount:</strong> <span className="total-amount">₹{selectedOrder.totalAmount.toFixed(2)}</span></p>
                  <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</p>
                  <p><strong>Shipping Fee:</strong> ₹{selectedOrder.shippingFee?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              <div className="order-items">
                <h4>Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className="items-list">
                  {selectedOrder.items && selectedOrder.items.map(item => (
                    <div key={item.id} className="item-card">
                      <div className="item-main-info">
                        <div className="product-name">{item.productName}</div>
                        {item.color && <div className="product-color">Color: {item.color}</div>}
                      </div>
                      <div className="item-details">
                        <div className="detail-row">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">₹{item.price.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{item.quantity}</span>
                        </div>
                        <div className="detail-row total-row">
                          <span className="detail-label">Total:</span>
                          <span className="detail-value total">₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Notification Info */}
              <div className="email-info">
                <h4>Email Notifications</h4>
                <p className="email-notice">
                  📧 Customer will automatically receive email notifications when order status changes.
                  This includes order updates, tracking information, and delivery confirmations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </OrdersWrapper>
  );
};

export default AdminOrders;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const modalSlideIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const OrdersWrapper = styled.div`
  .section-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 16px;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    animation: ${fadeIn} 0.6s ease-out;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;

    .header-content {
      flex: 1;
    }

    h2 {
      color: #2d3748;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    p {
      color: #718096;
      font-size: 1.1rem;
      margin: 0;
    }

    .refresh-btn {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
      flex-shrink: 0;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(66, 153, 225, 0.4);
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

  /* Notification Banner */
  .notification-banner {
    border-radius: 12px;
    margin-bottom: 2rem;
    animation: ${slideDown} 0.3s ease-out;

    &.success {
      background: rgba(72, 187, 120, 0.1);
      border: 1px solid rgba(72, 187, 120, 0.2);
      
      .notification-content {
        color: #2f855a;
      }
    }

    &.error {
      background: rgba(245, 101, 101, 0.1);
      border: 1px solid rgba(245, 101, 101, 0.2);
      
      .notification-content {
        color: #c53030;
      }
    }

    .notification-content {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
      font-size: 1rem;

      svg {
        flex-shrink: 0;
      }

      span {
        flex: 1;
      }

      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.2s ease;
        color: inherit;

        &:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

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
      font-size: 1rem;

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

  .filters-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
    align-items: center;
    animation: ${fadeIn} 0.6s ease-out 0.1s both;

    .search-box {
      flex: 1;
      position: relative;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #718096;
        z-index: 1;
      }

      input {
        width: 100%;
        padding: 12px 12px 12px 44px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        background: white;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
      }
    }

    .filter-select {
      select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
      }
    }
  }

  .orders-table-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: ${fadeIn} 0.6s ease-out 0.2s both;
    margin-bottom: 2rem;

    .loading-container {
      padding: 4rem;
      text-align: center;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #4299e1;
        border-radius: 50%;
        animation: ${spin} 1s linear infinite;
        margin: 0 auto 1rem auto;
      }

      p {
        color: #718096;
        font-size: 1.1rem;
      }
    }

    .no-orders {
      padding: 4rem;
      text-align: center;

      .no-orders-icon {
        color: #cbd5e0;
        margin-bottom: 1.5rem;
      }

      h3 {
        color: #4a5568;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: #718096;
        font-size: 1.1rem;
      }
    }

    .table-wrapper {
      overflow-x: auto;

      .orders-table {
        width: 100%;
        border-collapse: collapse;

        thead {
          background: rgba(66, 153, 225, 0.1);
          
          th {
            padding: 1.2rem 1rem;
            text-align: left;
            font-weight: 600;
            color: #2d3748;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
          }
        }

        tbody {
          .order-row {
            transition: all 0.3s ease;
            
            &:hover {
              background: rgba(66, 153, 225, 0.05);
            }

            &.even {
              background: rgba(247, 250, 252, 0.5);
            }

            td {
              padding: 1.2rem 1rem;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: middle;
              font-size: 1rem;
            }

            .order-id {
              font-weight: 600;
              color: #4299e1;
              font-size: 1.1rem;
            }

            .customer-info {
              .customer-details {
                .customer-name {
                  font-weight: 600;
                  color: #2d3748;
                  margin-bottom: 0.25rem;
                  font-size: 1rem;
                }

                .customer-email {
                  color: #718096;
                  font-size: 0.95rem;
                }
              }
            }

            .amount-cell {
              .amount {
                font-weight: 600;
                color: #2d3748;
                font-size: 1.2rem;
              }
            }

            .status-container {
              .status-badge {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                font-size: 1rem;
                text-transform: capitalize;

                .status-dot {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                }

                .status-icon {
                  font-size: 1rem;
                }
              }
            }

            .date-cell {
              color: #4a5568;
              font-size: 0.95rem;
            }

            .actions-cell {
              .action-buttons {
                display: flex;
                gap: 0.5rem;
                align-items: center;

                .action-btn {
                  width: 36px;
                  height: 36px;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.3s ease;

                  &.view {
                    background: rgba(66, 153, 225, 0.1);
                    color: #4299e1;

                    &:hover {
                      background: rgba(66, 153, 225, 0.2);
                      transform: scale(1.1);
                    }
                  }
                }

                .status-select {
                  padding: 8px 12px;
                  border: 2px solid #e2e8f0;
                  border-radius: 6px;
                  font-size: 0.9rem;
                  background: white;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  min-width: 130px;

                  &:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.1);
                  }

                  &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                  }

                  &.loading {
                    background: rgba(66, 153, 225, 0.1);
                  }

                  &:hover:not(:disabled) {
                    border-color: #4299e1;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    animation: ${fadeIn} 0.6s ease-out 0.3s both;

    .pagination-btn {
      background: #4299e1;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 1rem;

      &:hover:not(:disabled) {
        background: #3182ce;
        transform: translateY(-1px);
      }

      &:disabled {
        background: #cbd5e0;
        cursor: not-allowed;
        transform: none;
      }
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;

      .page-number {
        width: 40px;
        height: 40px;
        border: 2px solid #e2e8f0;
        background: white;
        color: #4a5568;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 1rem;

        &:hover {
          border-color: #4299e1;
          color: #4299e1;
        }

        &.active {
          background: #4299e1;
          color: white;
          border-color: #4299e1;
        }
      }
    }
  }

  /* Order Details Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .order-details-modal {
    background: white;
    border-radius: 16px;
    max-width: 1000px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: ${modalSlideIn} 0.3s ease-out;

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(66, 153, 225, 0.05);

      h3 {
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        color: #718096;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #2d3748;
        }
      }
    }

    .modal-content {
      padding: 2rem;

      .order-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;

        .info-section {
          h4 {
            color: #2d3748;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
          }

          p {
            margin: 0.5rem 0;
            color: #4a5568;
            line-height: 1.6;
            font-size: 1rem;

            strong {
              color: #2d3748;
              font-weight: 600;
            }

            .status-badge {
              margin-left: 0.5rem;
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              background: rgba(66, 153, 225, 0.1);
              font-size: 0.9rem;
              font-weight: 600;
              text-transform: uppercase;
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;

              .status-icon {
                font-size: 0.8rem;
              }
            }

            .total-amount {
              font-size: 1.3rem;
              font-weight: 700;
              color: #48bb78;
            }
          }
        }
      }

      .order-items {
        margin-bottom: 2rem;

        h4 {
          color: #2d3748;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .items-list {
          display: grid;
          gap: 1rem;

          .item-card {
            background: rgba(247, 250, 252, 0.5);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(66, 153, 225, 0.05);
              border-color: #cbd5e0;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .item-main-info {
              margin-bottom: 1rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #e2e8f0;

              .product-name {
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 0.5rem;
                font-size: 1.1rem;
              }

              .product-color {
                color: #718096;
                font-size: 0.95rem;
                font-style: italic;
              }
            }

            .item-details {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;

              .detail-row {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;

                .detail-label {
                  color: #718096;
                  font-size: 0.85rem;
                  font-weight: 500;
                  margin-bottom: 0.25rem;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }

                .detail-value {
                  color: #2d3748;
                  font-size: 1rem;
                  font-weight: 600;

                  &.total {
                    color: #48bb78;
                    font-size: 1.1rem;
                    font-weight: 700;
                  }
                }
              }

              .total-row {
                background: rgba(72, 187, 120, 0.1);
                border-radius: 8px;
                padding: 0.75rem;
                
                .detail-label {
                  color: #2f855a;
                }
              }
            }
          }
        }
      }

      .email-info {
        background: rgba(72, 187, 120, 0.05);
        border: 1px solid rgba(72, 187, 120, 0.2);
        border-radius: 12px;
        padding: 1.5rem;

        h4 {
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .email-notice {
          color: #2f855a;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
          font-weight: 500;
        }
      }
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    margin-bottom: 120px;

    .section-header {
      flex-direction: column;
      align-items: stretch;

      .refresh-btn {
        align-self: flex-end;
      }
    }

    .filters-section {
      flex-direction: column;
      align-items: stretch;

      .search-box,
      .filter-select {
        width: 100%;
      }
    }

    .orders-table-container .table-wrapper {
      .orders-table {
        font-size: 0.9rem;

        thead th {
          padding: 1rem 0.5rem;
        }

        tbody .order-row td {
          padding: 1rem 0.5rem;

          .actions-cell .action-buttons {
            flex-direction: column;
            gap: 0.25rem;

            .status-select {
              min-width: 100px;
              font-size: 0.8rem;
            }
          }
        }
      }
    }

    .order-details-modal {
      margin: 1rem;
      max-height: 95vh;

      .modal-content {
        padding: 1rem;

        .order-info-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .order-items .items-list .item-card {
          padding: 1rem;
          
          .item-details {
            grid-template-columns: 1fr;
            gap: 0.75rem;

            .detail-row {
              flex-direction: row;
              justify-content: space-between;
              text-align: left;
              padding: 0.5rem 0;
              border-bottom: 1px solid #f1f5f9;

              &:last-child {
                border-bottom: none;
              }

              &.total-row {
                background: none;
                border-radius: 0;
                padding: 0.75rem 0;
                border-top: 2px solid #48bb78;
                margin-top: 0.5rem;
                font-size: 1.1rem;
              }
            }
          }
        }
      }
    }

    .pagination {
      flex-wrap: wrap;
      gap: 0.5rem;

      .page-numbers {
        order: 3;
        width: 100%;
        justify-content: center;
      }
    }
  }

  @media (max-width: 480px) {
    .orders-table-container .table-wrapper {
      .orders-table {
        font-size: 0.85rem;

        .customer-info .customer-details {
          .customer-name {
            font-size: 0.9rem;
          }
          .customer-email {
            font-size: 0.8rem;
          }
        }

        .amount-cell .amount {
          font-size: 1.1rem;
        }
      }
    }
  }
`;