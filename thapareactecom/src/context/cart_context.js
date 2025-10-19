import React, { createContext, useReducer, useContext, useEffect, useCallback } from "react";
import cartReducer from "../reducer/cartReducer";

const CartContext = createContext();

const initialState = {
  cart: [],
  total_items: 0,
  total_amount: 0, // ✅ Make sure this matches what Cart.js expects
  shipping_fee: 5000,
  isLoading: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Add useEffect to recalculate totals whenever cart changes
  useEffect(() => {
    dispatch({ type: "CART_ITEM_PRICE_TOTAL" });
  }, [state.cart]);

  // Enhanced token retrieval with multiple fallbacks
  const getToken = () => {
    const possibleKeys = ["token", "authToken", "jwtToken", "accessToken"];
    const storages = [localStorage, sessionStorage];

    for (const storage of storages) {
      for (const key of possibleKeys) {
        const token = storage.getItem(key);
        if (token) {
          console.log(`🔑 Token found with key: ${key}`);
          return token;
        }
      }
    }

    console.warn("⚠️ No authentication token found");
    return null;
  };

  // Validate if user is authenticated
  const isAuthenticated = () => {
    const token = getToken();
    if (!token) {
      console.warn("❌ User not authenticated - no token");
      return false;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp && payload.exp < Date.now() / 1000;
      
      if (isExpired) {
        console.warn("❌ Token is expired");
        localStorage.removeItem("token");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      return false;
    }
  };

  // Get authenticated headers
  const getAuthHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (isAuthenticated()) {
      const token = getToken();
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  // Test authentication first
  const testAuthentication = async () => {
    try {
      const response = await fetch("https://stopshop-backend.onrender.com/api/cart/test", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      console.log("🔍 Auth test result:", data);
      return data.authenticated;
    } catch (error) {
      console.error("❌ Auth test failed:", error);
      return false;
    }
  };

  // Fetch cart items from backend
  const fetchCartFromBackend = useCallback(async () => {
    console.log("📥 Fetching cart from backend...");
    
    const token = getToken();
    if (!token) {
      console.log("❌ Not authenticated, skipping cart fetch");
      // Clear cart state when not authenticated
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch("https://stopshop-backend.onrender.com/api/cart/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error("❌ Unauthorized - clearing local cart");
        localStorage.removeItem("token");
        dispatch({ type: "CLEAR_CART" });
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const cartItemsFromDb = await response.json();
      console.log("✅ Fetched cart items from backend:", cartItemsFromDb);

      // Transform backend cart items to match frontend format
      const transformedCartItems = cartItemsFromDb.map(item => ({
        id: item.productId,
        name: item.productName,
        image: item.productImage || "default-product.jpg",
        color: item.color,
        price: item.price,
        amount: item.quantity,
        cartItemId: item.id,
        max: 10,
      }));

      // Update local state with backend data
      dispatch({ type: "LOAD_CART_FROM_BACKEND", payload: transformedCartItems });
      console.log("✅ Cart state updated from backend");

    } catch (error) {
      console.error("❌ Failed to fetch cart from backend:", error);
      // On error, clear cart to prevent showing stale data
      dispatch({ type: "CLEAR_CART" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // ✅ NEW: Auto-fetch cart when authentication status changes
  useEffect(() => {
    let mounted = true;
    
    const checkAndFetchCart = async () => {
      const token = localStorage.getItem("token");
      console.log("🔄 Auth status check - Token exists:", !!token);
      
      if (token && mounted) {
        console.log("🛒 User authenticated, fetching cart automatically");
        await fetchCartFromBackend();
      } else if (!token && mounted) {
        console.log("❌ User not authenticated, clearing cart");
        dispatch({ type: "CLEAR_CART" });
      }
    };

    // Initial check
    checkAndFetchCart();

    // ✅ Listen for storage changes (login/logout events)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        console.log("📡 Token storage change detected:", e.newValue ? 'LOGIN' : 'LOGOUT');
        checkAndFetchCart();
      }
    };

    // ✅ Listen for custom login events
    const handleLoginEvent = () => {
      console.log("📡 Login event detected");
      setTimeout(() => {
        if (mounted) {
          checkAndFetchCart();
        }
      }, 100); // Small delay to ensure token is set
    };

    // ✅ Listen for cart update events
    const handleCartUpdate = () => {
      console.log("📡 Cart update event detected");
      if (mounted && localStorage.getItem("token")) {
        fetchCartFromBackend();
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCartFromBackend]);

  // Add to cart with comprehensive error handling
  const addToCart = async (id, color, amount, product) => {
    console.log("🛒 Adding to cart:", { id, color, amount });

    if (!isAuthenticated()) {
      console.error("❌ Cannot add to cart - user not authenticated");
      alert("Please login to add items to cart");
      return false;
    }

    const isBackendAuthValid = await testAuthentication();
    if (!isBackendAuthValid) {
      console.error("❌ Backend authentication test failed");
      alert("Authentication issue. Please login again.");
      return false;
    }

    try {
      const requestData = {
        productId: id,
        productName: product?.name || `Product ${id}`,
        productImage: product?.image?.[0]?.url || "default-product.jpg",
        color,
        quantity: amount,
        price: product?.price || 100,
      };

      console.log("📦 Sending request:", requestData);

      const response = await fetch("https://stopshop-backend.onrender.com/api/cart/add", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      if (response.status === 401) {
        console.error("❌ Unauthorized - token might be invalid");
        localStorage.removeItem("token");
        alert("Session expired. Please login again.");
        return false;
      }

      if (response.status === 403) {
        console.error("❌ Forbidden - insufficient permissions");
        alert("Access denied. Please check your permissions.");
        return false;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Server error ${response.status}:`, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ Cart item saved to backend:", responseData);
      
      // After successful backend save, refresh cart from backend
      await fetchCartFromBackend();
      
      // Dispatch custom event to notify cart page to refresh
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
      
    } catch (error) {
      console.error("❌ Failed to save cart item:", error);
      
      if (error.message.includes('Failed to fetch')) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
      return false;
    }
  };

  // ✅ Enhanced removeItem function with better error handling
  const removeItem = async (cartItemId) => {
    console.log("🗑️ Removing item from cart:", cartItemId);

    if (!isAuthenticated()) {
      console.error("❌ Cannot remove item - user not authenticated");
      alert("Please login to remove items from cart");
      return;
    }

    try {
      // Show immediate feedback by removing from local state first
      dispatch({ type: "REMOVE_ITEM", payload: cartItemId });

      const response = await fetch(`https://stopshop-backend.onrender.com/api/cart/remove/${cartItemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        console.error("❌ Unauthorized - token might be invalid");
        localStorage.removeItem("token");
        alert("Session expired. Please login again.");
        // Refresh cart to restore correct state
        await fetchCartFromBackend();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ Failed to remove item from backend:", response.status, errorData);
        
        // Revert local state if backend fails
        await fetchCartFromBackend();
        
        if (response.status === 404) {
          alert("Item not found in cart");
        } else {
          alert("Failed to remove item. Please try again.");
        }
        return;
      }

      console.log("✅ Item removed from backend successfully");
      
      // Optionally refresh cart from backend to ensure consistency
      await fetchCartFromBackend();
      
    } catch (error) {
      console.error("❌ Error removing item:", error);
      alert("Failed to remove item. Please try again.");
      // Refresh cart from backend to restore correct state
      await fetchCartFromBackend();
    }
  };

  // Increase quantity
  const setIncrease = async (cartItemId) => {
    console.log("➕ Increasing quantity for item:", cartItemId);

    if (!isAuthenticated()) {
      console.error("❌ Cannot update quantity - user not authenticated");
      return;
    }

    try {
      // Find current item to get current quantity
      const currentItem = state.cart.find(item => item.cartItemId === cartItemId);
      if (!currentItem) {
        console.error("❌ Item not found in cart");
        return;
      }

      const newQuantity = currentItem.amount + 1;
      
      // Check max stock limit
      if (newQuantity > currentItem.max) {
        alert(`Maximum stock available: ${currentItem.max}`);
        return;
      }

      // First update local state for immediate feedback
      dispatch({ type: "SET_INCREASE", payload: cartItemId });

      // Then sync with backend
      const response = await fetch(`https://stopshop-backend.onrender.com/api/cart/update-quantity`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cartItemId: cartItemId,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        console.error("❌ Failed to update quantity on backend:", response.status);
        // Revert local state if backend fails
        await fetchCartFromBackend();
        throw new Error(`Failed to update quantity: ${response.status}`);
      }

      console.log("✅ Quantity updated on backend successfully");
      
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
      // Refresh cart from backend to restore correct state
      await fetchCartFromBackend();
    }
  };

  // Decrease quantity
  const setDecrease = async (cartItemId) => {
    console.log("➖ Decreasing quantity for item:", cartItemId);

    if (!isAuthenticated()) {
      console.error("❌ Cannot update quantity - user not authenticated");
      return;
    }

    try {
      // Find current item to get current quantity
      const currentItem = state.cart.find(item => item.cartItemId === cartItemId);
      if (!currentItem) {
        console.error("❌ Item not found in cart");
        return;
      }

      const newQuantity = currentItem.amount - 1;
      
      // Don't allow quantity to go below 1
      if (newQuantity < 1) {
        return;
      }

      // First update local state for immediate feedback
      dispatch({ type: "SET_DECREASE", payload: cartItemId });

      // Then sync with backend
      const response = await fetch(`https://stopshop-backend.onrender.com/api/cart/update-quantity`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cartItemId: cartItemId,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        console.error("❌ Failed to update quantity on backend:", response.status);
        // Revert local state if backend fails
        await fetchCartFromBackend();
        throw new Error(`Failed to update quantity: ${response.status}`);
      }

      console.log("✅ Quantity updated on backend successfully");
      
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
      // Refresh cart from backend to restore correct state
      await fetchCartFromBackend();
    }
  };

  // ✅ Updated clearCart function to work with Cart.js modal UI
  // Removed the window.confirm dialog to let Cart.js handle the modal confirmation
  const clearCart = async () => {
    console.log("🗑️ Clearing cart...");
    
    if (!isAuthenticated()) {
      console.error("❌ Cannot clear cart - user not authenticated");
      alert("Please login to clear your cart");
      return;
    }

    try {
      // First clear local state for immediate feedback
      dispatch({ type: "CLEAR_CART" });

      const response = await fetch("https://stopshop-backend.onrender.com/api/cart/clear", {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        console.error("❌ Unauthorized - token might be invalid");
        localStorage.removeItem("token");
        alert("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ Failed to clear cart on backend:", response.status, errorData);
        
        // Refresh cart from backend to restore correct state
        await fetchCartFromBackend();
        alert("Failed to clear cart. Please try again.");
        return;
      }

      console.log("✅ Cart cleared on backend successfully");
      
      // Optionally refresh cart from backend to ensure consistency
      await fetchCartFromBackend();
      
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      alert("Failed to clear cart. Please try again.");
      // Refresh cart from backend to restore correct state
      await fetchCartFromBackend();
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeItem,
        setIncrease,
        setDecrease,
        clearCart,
        isAuthenticated,
        fetchCartFromBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  return useContext(CartContext);
};