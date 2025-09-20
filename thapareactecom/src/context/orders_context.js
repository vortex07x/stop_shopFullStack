// src/context/orders_context.js
import React, { createContext, useContext, useReducer, useCallback } from "react";

const OrdersContext = createContext();

const initialState = {
  orders: [],
  isLoading: false,
  error: null,
};

const ordersReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "LOAD_ORDERS":
      return { ...state, orders: action.payload, isLoading: false, error: null };
    case "CLEAR_ORDERS":
      return { ...state, orders: [] };
    case "PLACE_ORDER_SUCCESS":
      return { 
        ...state, 
        orders: [action.payload, ...state.orders], 
        isLoading: false, 
        error: null 
      };
    default:
      return state;
  }
};

export const OrdersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  // Enhanced token retrieval
  const getToken = useCallback(() => {
    const possibleKeys = ["token", "authToken", "jwtToken", "accessToken"];
    const storages = [localStorage, sessionStorage];

    for (const storage of storages) {
      for (const key of possibleKeys) {
        const token = storage.getItem(key);
        if (token) return token;
      }
    }
    return null;
  }, []);

  // Get authenticated headers
  const getAuthHeaders = useCallback(() => {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [getToken]);

  // ✅ FIXED: Wrapped in useCallback to prevent infinite re-renders
  const fetchOrdersFromBackend = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token found, skipping orders fetch");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch("http://localhost:8080/api/orders/my-orders", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        console.error("Unauthorized - clearing token");
        localStorage.removeItem("token");
        dispatch({ type: "SET_ERROR", payload: "Authentication failed" });
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const ordersFromDb = await response.json();
      console.log("Fetched orders from backend:", ordersFromDb);

      dispatch({ type: "LOAD_ORDERS", payload: ordersFromDb });

    } catch (error) {
      console.error("Failed to fetch orders from backend:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  }, [getToken, getAuthHeaders]); // ✅ Only depend on stable functions

  // Place order by calling backend API
  const placeOrder = useCallback(async (cartItems) => {
    const token = getToken();
    if (!token) {
      alert("Please login to place an order");
      return false;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Calculate totals
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.amount), 0);
      const shippingFee = 5000; // 50.00 in cents
      const orderTotal = subtotal + shippingFee;

      // Transform cart items to match backend DTO
      const transformedCartItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        color: item.color,
        price: item.price,
        quantity: item.amount,
      }));

      const orderRequest = {
        cartItems: transformedCartItems,
        subtotal: subtotal,
        shippingFee: shippingFee,
        orderTotal: orderTotal,
      };

      console.log("Placing order with data:", orderRequest);

      const response = await fetch("http://localhost:8080/api/orders/place-order", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderRequest),
      });

      if (response.status === 401) {
        console.error("Unauthorized - token might be invalid");
        localStorage.removeItem("token");
        alert("Session expired. Please login again.");
        dispatch({ type: "SET_ERROR", payload: "Authentication failed" });
        return false;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Order placement failed ${response.status}:`, errorText);
        throw new Error(`Failed to place order: ${response.status}`);
      }

      const newOrder = await response.json();
      console.log("Order placed successfully:", newOrder);
      
      dispatch({ type: "PLACE_ORDER_SUCCESS", payload: newOrder });
      return true;

    } catch (error) {
      console.error("Failed to place order:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      
      if (error.message.includes('Failed to fetch')) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Failed to place order. Please try again.");
      }
      return false;
    }
  }, [getToken, getAuthHeaders]);

  const clearOrders = useCallback(() => {
    dispatch({ type: "CLEAR_ORDERS" });
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        ...state,
        placeOrder,
        clearOrders,
        fetchOrdersFromBackend,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrdersContext = () => useContext(OrdersContext);