// src/context/AdminContext.js
import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  users: [],
  orders: [],
  stats: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  },
  loading: {
    users: false,
    orders: false,
    stats: false
  },
  error: {
    users: null,
    orders: null,
    stats: null
  }
};

// Action types
const ActionTypes = {
  FETCH_STATS_START: 'FETCH_STATS_START',
  FETCH_STATS_SUCCESS: 'FETCH_STATS_SUCCESS',
  FETCH_STATS_ERROR: 'FETCH_STATS_ERROR',
  
  FETCH_USERS_START: 'FETCH_USERS_START',
  FETCH_USERS_SUCCESS: 'FETCH_USERS_SUCCESS',
  FETCH_USERS_ERROR: 'FETCH_USERS_ERROR',
  UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
  DELETE_USER: 'DELETE_USER',
  
  FETCH_ORDERS_START: 'FETCH_ORDERS_START',
  FETCH_ORDERS_SUCCESS: 'FETCH_ORDERS_SUCCESS',
  FETCH_ORDERS_ERROR: 'FETCH_ORDERS_ERROR',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const adminReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_STATS_START:
      return {
        ...state,
        loading: { ...state.loading, stats: true },
        error: { ...state.error, stats: null }
      };
    
    case ActionTypes.FETCH_STATS_SUCCESS:
      return {
        ...state,
        stats: action.payload,
        loading: { ...state.loading, stats: false }
      };
    
    case ActionTypes.FETCH_STATS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, stats: false },
        error: { ...state.error, stats: action.payload }
      };
    
    case ActionTypes.FETCH_USERS_START:
      return {
        ...state,
        loading: { ...state.loading, users: true },
        error: { ...state.error, users: null }
      };
    
    case ActionTypes.FETCH_USERS_SUCCESS:
      return {
        ...state,
        users: action.payload,
        loading: { ...state.loading, users: false }
      };
    
    case ActionTypes.FETCH_USERS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: action.payload }
      };
    
    case ActionTypes.UPDATE_USER_ROLE:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, role: action.payload.role }
            : user
        )
      };
    
    case ActionTypes.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    case ActionTypes.FETCH_ORDERS_START:
      return {
        ...state,
        loading: { ...state.loading, orders: true },
        error: { ...state.error, orders: null }
      };
    
    case ActionTypes.FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        orders: action.payload,
        loading: { ...state.loading, orders: false }
      };
    
    case ActionTypes.FETCH_ORDERS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, orders: false },
        error: { ...state.error, orders: action.payload }
      };
    
    case ActionTypes.UPDATE_ORDER_STATUS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: { ...state.error, [action.payload]: null }
      };
    
    default:
      return state;
  }
};

// Create context
const AdminContext = createContext();

// Provider component
export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  
  const API_BASE_URL = "https://stopshopfullstack-production.up.railway.app/api/admin";
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  // Fetch admin stats
  const fetchAdminStats = async () => {
    dispatch({ type: ActionTypes.FETCH_STATS_START });
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: "GET",
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const stats = await response.json();
        dispatch({
          type: ActionTypes.FETCH_STATS_SUCCESS,
          payload: stats
        });
      } else if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      dispatch({
        type: ActionTypes.FETCH_STATS_ERROR,
        payload: error.message
      });
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    dispatch({ type: ActionTypes.FETCH_USERS_START });
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const users = await response.json();
        dispatch({
          type: ActionTypes.FETCH_USERS_SUCCESS,
          payload: users
        });
      } else if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      dispatch({
        type: ActionTypes.FETCH_USERS_ERROR,
        payload: error.message
      });
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    dispatch({ type: ActionTypes.FETCH_ORDERS_START });
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "GET", 
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const orders = await response.json();
        dispatch({
          type: ActionTypes.FETCH_ORDERS_SUCCESS,
          payload: orders
        });
      } else if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      dispatch({
        type: ActionTypes.FETCH_ORDERS_ERROR,
        payload: error.message
      });
    }
  };

  // Update user role
  const updateUserRole = async (userId, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({
          type: ActionTypes.UPDATE_USER_ROLE,
          payload: { userId, role }
        });
        return { success: true, message: result.message || `User role updated to ${role}` };
      } else if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      return { success: false, message: error.message };
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({
          type: ActionTypes.DELETE_USER,
          payload: userId
        });
        return { success: true, message: result.message || 'User deleted successfully' };
      } else if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, message: error.message };
    }
  };

  // Enhanced update order status with better error handling and feedback
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the local state
        dispatch({
          type: ActionTypes.UPDATE_ORDER_STATUS,
          payload: { orderId, status }
        });
        
        return { 
          success: true, 
          message: result.message || `Order status updated to ${status.toUpperCase()}`,
          emailSent: true // Indicates that email notification was triggered
        };
      } else if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.");
      } else if (response.status === 404) {
        throw new Error("Order not found");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update order status (${response.status})`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      
      // Return more specific error information
      return { 
        success: false, 
        message: error.message,
        emailSent: false
      };
    }
  };

  // Enhanced clear errors function with better logging
  const clearError = (errorType) => {
    console.log(`Clearing error for: ${errorType}`);
    dispatch({
      type: ActionTypes.CLEAR_ERROR,
      payload: errorType
    });
  };

  // Helper function to get order statistics
  const getOrderStats = () => {
    const orderCounts = state.orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: state.orders.length,
      pending: orderCounts.pending || 0,
      processing: orderCounts.processing || 0,
      shipped: orderCounts.shipped || 0,
      delivered: orderCounts.delivered || 0,
      cancelled: orderCounts.cancelled || 0
    };
  };

  // Helper function to get recent orders (last 10)
  const getRecentOrders = () => {
    return state.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  // Helper function to check if there are orders that need attention
  const getOrdersNeedingAttention = () => {
    return state.orders.filter(order => 
      order.status?.toLowerCase() === 'pending' || 
      order.status?.toLowerCase() === 'processing'
    );
  };

  const value = {
    // State
    ...state,
    
    // Actions
    fetchAdminStats,
    fetchUsers,
    updateUserRole,
    deleteUser,
    fetchOrders,
    updateOrderStatus,
    clearError,
    
    // Helper functions
    getOrderStats,
    getRecentOrders,
    getOrdersNeedingAttention
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook with enhanced error handling
export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  
  return context;
};

export default AdminContext;