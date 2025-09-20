import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useCartContext } from "./context/cart_context";
import CartItem from "./components/CartItem";
import { Button } from "./styles/Button";
import FormatPrice from "./Helpers/FormatPrice";
import { useOrdersContext } from "./context/orders_context";
import AuthForm from "./components/AuthForm";

const Cart = () => {
  const { 
    cart, 
    clearCart, 
    total_amount = 0,
    shipping_fee = 5000,
    isLoading, 
    fetchCartFromBackend, 
    isAuthenticated
  } = useCartContext();
  
  const { placeOrder, isLoading: orderLoading } = useOrdersContext();

  const [showPopup, setShowPopup] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Calculate safe totals to prevent NaN
  const safeTotal = typeof total_amount === 'number' && !isNaN(total_amount) ? total_amount : 0;
  const safeShipping = typeof shipping_fee === 'number' && !isNaN(shipping_fee) ? shipping_fee : 5000;

  // Fetch cart items from backend when component mounts or navigation changes
  useEffect(() => {
    console.log("Cart component effect - fetching cart");
    
    const token = localStorage.getItem("token");
    if (token) {
      console.log("User has token, fetching cart from backend");
      fetchCartFromBackend();
    }
  }, [location.key, fetchCartFromBackend]);

  // Also refresh when the cart component receives focus/becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/cart') {
        console.log("Page became visible on cart route, refreshing");
        const token = localStorage.getItem("token");
        if (token) {
          fetchCartFromBackend();
        }
      }
    };

    const handleFocus = () => {
      if (location.pathname === '/cart') {
        console.log("Window focused on cart route, refreshing");
        const token = localStorage.getItem("token");
        if (token) {
          fetchCartFromBackend();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [location.pathname, fetchCartFromBackend]);

  // Updated place order logic with proper error handling
  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      setShowAuthForm(true);
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    try {
      console.log("Placing order with cart items:", cart);
      const success = await placeOrder(cart);
      
      if (success) {
        // Show success popup
        setShowPopup(true);
        
        // Redirect to orders page after a delay
        setTimeout(() => {
          setShowPopup(false);
          navigate("/orders");
        }, 2000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Handle clear cart with custom modal
  const handleClearCartClick = () => {
    if (!isLoggedIn) {
      setShowAuthForm(true);
      return;
    }
    setShowClearCartModal(true);
  };

  const handleConfirmClearCart = async () => {
    setShowClearCartModal(false);
    await clearCart();
  };

  const handleCancelClearCart = () => {
    setShowClearCartModal(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <EmptyDiv>
        <h3>Loading your cart...</h3>
      </EmptyDiv>
    );
  }

  // Show empty cart message
  if (cart.length === 0) {
    return (
      <EmptyDiv>
        <h3>{isLoggedIn ? "No items in cart" : "Please login to view your cart"}</h3>
        {!isLoggedIn && (
          <Button onClick={() => setShowAuthForm(true)}>
            Login / Register
          </Button>
        )}
        {showAuthForm && (
          <AuthForm
            onClose={() => {
              setShowAuthForm(false);
            }}
          />
        )}
      </EmptyDiv>
    );
  }

  return (
    <Wrapper>
      <div className="container">
        <div className="cart-heading grid grid-five-column">
          <p>Item</p>
          <p className="cart-hide">Price</p>
          <p>Quantity</p>
          <p className="cart-hide">Subtotal</p>
          <p>Remove</p>
        </div>
        <hr />

        <div className="cart-item">
          {cart.map((curElem) => (
            <CartItem key={`${curElem.id}-${curElem.color}`} {...curElem} />
          ))}
        </div>
        <hr />

        <div className="cart-two-button">
          <div className="left-buttons">
            <NavLink to="/products">
              <Button>Continue Shopping</Button>
            </NavLink>

            {cart.length > 0 && (
              <Button 
                className="btn-order" 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || orderLoading}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>
            )}
          </div>

          <div className="right-button">
            <Button
              className="btn btn-clear"
              onClick={handleClearCartClick}
              aria-label="Clear all items from cart"
              disabled={isPlacingOrder}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order total */}
        <div className="order-total--amount">
          <div className="order-total--subdata">
            <div>
              <p>Subtotal:</p>
              <p>
                <FormatPrice price={safeTotal} />
              </p>
            </div>
            <div>
              <p>Shipping Fee:</p>
              <p>
                <FormatPrice price={safeShipping} />
              </p>
            </div>
            <hr />
            <div>
              <p>Order Total:</p>
              <p>
                <FormatPrice price={safeShipping + safeTotal} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order placed popup */}
      {showPopup && (
        <div className="order-popup">
          <div className="popup-content">
            <span className="checkmark">✔</span>
            <p>Order Placed Successfully!</p>
            <small>Redirecting to orders page...</small>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Clear Cart</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to clear your entire cart?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <Button 
                className="btn-cancel" 
                onClick={handleCancelClearCart}
              >
                Cancel
              </Button>
              <Button 
                className="btn-confirm" 
                onClick={handleConfirmClearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AuthForm popup */}
      {showAuthForm && (
        <AuthForm
          onClose={() => {
            setShowAuthForm(false);
          }}
        />
      )}
    </Wrapper>
  );
};

const EmptyDiv = styled.div`
  display: grid;
  place-items: center;
  height: 50vh;
  gap: 2rem;

  h3 {
    font-size: 4.2rem;
    text-transform: capitalize;
    font-weight: 300;
  }
`;

const Wrapper = styled.section`
  padding: 9rem 0;

  .grid-five-column {
    grid-template-columns: repeat(4, 1fr) 0.3fr;
    text-align: center;
    align-items: center;
  }

  .cart-heading {
    text-align: center;
    text-transform: uppercase;
  }

  hr {
    margin-top: 1rem;
  }

  .cart-item {
    padding: 3.2rem 0;
    display: flex;
    flex-direction: column;
    gap: 3.2rem;
  }

  .cart-user--profile {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 5.4rem;

    img {
      width: 8rem;
      height: 8rem;
      border-radius: 50%;
    }
    h2 {
      font-size: 2.4rem;
    }
  }

  .cart-user--name {
    text-transform: capitalize;
  }

  .cart-image--name {
    display: grid;
    gap: 1rem;
    grid-template-columns: 0.4fr 1fr;
    text-transform: capitalize;
    text-align: left;
    align-items: center;

    img {
      max-width: 5rem;
      height: 5rem;
      object-fit: contain;
    }

    .color-div {
      display: flex;
      align-items: center;
      gap: 1rem;

      .color-style {
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 50%;
      }
    }
  }

  .cart-two-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;

    .left-buttons {
      display: flex;
      gap: 1rem;
    }

    .right-button {
      display: flex;
    }

    .btn-order {
      background-color: #2ecc71;
      &:hover {
        background-color: #27ae60;
      }
      
      &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
        opacity: 0.7;
      }
    }

    .btn-clear {
      background-color: #e74c3c !important;
      color: #fff;

      &:hover {
        background-color: #c0392b !important;
      }
      
      &:disabled {
        background-color: #95a5a6 !important;
        cursor: not-allowed;
        opacity: 0.7;
      }
    }
  }

  .amount-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2.4rem;
    font-size: 1.4rem;

    button {
      border: none;
      background-color: #fff;
      cursor: pointer;
    }

    .amount-style {
      font-size: 2.4rem;
      color: ${({ theme }) => theme.colors.btn};
    }
  }

  .remove_icon {
    font-size: 1.6rem;
    color: #e74c3c;
    cursor: pointer;
  }

  .order-total--amount {
    width: 100%;
    margin: 4.8rem 0;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    text-transform: capitalize;

    .order-total--subdata {
      border: 0.1rem solid #f0f0f0;
      display: flex;
      flex-direction: column;
      gap: 1.8rem;
      padding: 3.2rem;
    }

    div {
      display: flex;
      justify-content: space-between;
      gap: 3.2rem;
    }

    div:last-child {
      background-color: #fafafa;
    }

    div p:last-child {
      font-weight: bold;
      color: ${({ theme }) => theme.colors.heading};
    }
  }

  .order-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .popup-content {
    background: #fff;
    padding: 3rem 5rem;
    border-radius: 1rem;
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .popup-content .checkmark {
    font-size: 4rem;
    color: #2ecc71;
    display: block;
    margin-bottom: 1rem;
  }

  .popup-content p {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .popup-content small {
    font-size: 1.4rem;
    color: #666;
  }

  /* Clear Cart Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;
  }

  .modal-content {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 45rem;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideIn 0.3s ease-out;
  }

  .modal-header {
    padding: 2rem 3rem 1rem 3rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 2.2rem;
    color: #333;
    font-weight: 600;
  }

  .modal-body {
    padding: 2rem 3rem;
  }

  .modal-body p {
    margin: 0 0 1rem 0;
    font-size: 1.6rem;
    color: #555;
    line-height: 1.5;
  }

  .modal-warning {
    color: #e74c3c !important;
    font-weight: 500;
    font-size: 1.4rem !important;
  }

  .modal-footer {
    padding: 1rem 3rem 2rem 3rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    border-top: 1px solid #e0e0e0;
  }

  .modal-footer .btn-cancel {
    background-color: #6c757d;
    color: #fff;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.4rem;
    
    &:hover {
      background-color: #5a6268;
    }
  }

  .modal-footer .btn-confirm {
    background-color: #e74c3c;
    color: #fff;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.4rem;
    
    &:hover {
      background-color: #c0392b;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-2rem) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .grid-five-column {
      grid-template-columns: 1.5fr 1fr 0.5fr;
    }

    .cart-hide {
      display: none;
    }

    .cart-two-button {
      gap: 2.2rem;
    }

    .order-total--amount {
      justify-content: flex-start;
      align-items: flex-start;

      .order-total--subdata {
        width: 100%;
      }
    }

    .modal-content {
      width: 95%;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
      padding: 1.5rem 2rem;
    }

    .modal-footer {
      flex-direction: column;
    }

    .modal-footer .btn-cancel,
    .modal-footer .btn-confirm {
      width: 100%;
      margin: 0;
    }
  }
`;

export default Cart;