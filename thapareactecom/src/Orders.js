// src/Orders.js
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { Button } from "./styles/Button";
import FormatPrice from "./Helpers/FormatPrice";
import { useOrdersContext } from "./context/orders_context";
import AuthForm from "./components/AuthForm";

const Orders = () => {
  const { orders, isLoading, error, fetchOrdersFromBackend } = useOrdersContext();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // ✅ Added to prevent multiple fetches

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // ✅ FIXED: Memoized function to prevent recreating on every render
  const handleFetchOrders = useCallback(() => {
    if (isLoggedIn && !hasFetched) {
      console.log("Fetching orders for the first time...");
      fetchOrdersFromBackend();
      setHasFetched(true);
    }
  }, [isLoggedIn, fetchOrdersFromBackend, hasFetched]);

  // ✅ FIXED: Only fetch once when component mounts if logged in
  useEffect(() => {
    handleFetchOrders();
  }, [handleFetchOrders]);

  // ✅ FIXED: Reset hasFetched when login status changes
  useEffect(() => {
    if (!isLoggedIn) {
      setHasFetched(false);
    }
  }, [isLoggedIn]);

  // ✅ FIXED: Separate manual refresh function
  const handleRefresh = useCallback(() => {
    if (isLoggedIn) {
      console.log("Manually refreshing orders...");
      setHasFetched(false); // Reset flag
      fetchOrdersFromBackend();
      setHasFetched(true);
    }
  }, [isLoggedIn, fetchOrdersFromBackend]);

  // Show loading state
  if (isLoading) {
    return (
      <EmptyDiv>
        <h3>Loading your orders...</h3>
      </EmptyDiv>
    );
  }

  // Show error state
  if (error) {
    return (
      <EmptyDiv>
        <h3>Error loading orders</h3>
        <p>{error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </EmptyDiv>
    );
  }

  // Show login prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <EmptyDiv>
        <h3>Please login to view your orders</h3>
        <Button onClick={() => setShowAuthForm(true)}>
          Login / Register
        </Button>
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

  // Show empty orders message
  if (!orders || orders.length === 0) {
    return (
      <EmptyDiv>
        <h3>No orders found</h3>
        <p>You haven't placed any orders yet.</p>
        <Button onClick={handleRefresh}>Refresh</Button>
      </EmptyDiv>
    );
  }

  return (
    <Wrapper>
      <div className="container">
        <div className="orders-header">
          <h2>My Orders</h2>
          <p>View and track your order history</p>
          <Button 
            onClick={handleRefresh} 
            className="refresh-btn"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh Orders"}
          </Button>
        </div>

        {orders.map((order) => (
          <div key={order.id} className="order-card">
            {/* Status Badge */}
            <span className={`order-status status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>

            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.id}</h3>
                <span className="order-date">
                  Placed on: {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="order-items-count">
                  {order.totalItems} items • <FormatPrice price={order.orderTotal} />
                </span>
              </div>
            </div>

            <div className="cart-heading grid grid-four-column">
              <p>Item</p>
              <p className="cart-hide">Price</p>
              <p>Quantity</p>
              <p className="cart-hide">Subtotal</p>
            </div>
            <hr />

            <div className="order-items">
              {order.items && order.items.map((item, idx) => (
                <div className="cart-item grid grid-four-column" key={item.id || idx}>
                  <div className="cart-image--name">
                    <img 
                      src={item.productImage || "default-product.jpg"} 
                      alt={item.productName}
                      onError={(e) => {
                        e.target.src = "default-product.jpg";
                      }}
                    />
                    <div>
                      <p className="product-name">{item.productName}</p>
                      <div className="color-div">
                        <p>Color:</p>
                        <span
                          className="color-style"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="cart-hide">
                    <FormatPrice price={item.price} />
                  </p>
                  <p>{item.quantity}</p>
                  <p className="cart-hide">
                    <FormatPrice price={item.price * item.quantity} />
                  </p>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span><FormatPrice price={order.subtotal} /></span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span><FormatPrice price={order.shippingFee} /></span>
                </div>
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span><FormatPrice price={order.orderTotal} /></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};

const EmptyDiv = styled.div`
  display: grid;
  place-items: center;
  height: 50vh;
  gap: 2rem;

  h3 {
    font-size: 3.2rem;
    text-transform: capitalize;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.heading};
  }

  p {
    font-size: 1.6rem;
    color: #666;
  }
`;

const Wrapper = styled.section`
  padding: 6rem 0;

  .orders-header {
    text-align: center;
    margin-bottom: 4rem;

    h2 {
      font-size: 3.6rem;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.8rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .refresh-btn {
      background-color: ${({ theme }) => theme.colors.btn};
      font-size: 1.4rem;
      padding: 1rem 2rem;
      
      &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
        opacity: 0.7;
      }
    }
  }

  .order-card {
    position: relative;
    background: #fff;
    border-radius: 1.2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    margin-bottom: 3rem;
    padding: 2rem 2.5rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #f0f0f0;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  }

  .order-status {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.6rem 1.2rem;
    border-radius: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.status-ordered {
      background: #3498db;
      color: #fff;
    }

    &.status-pending {
      background: #f39c12;
      color: #fff;
    }

    &.status-confirmed {
      background: #2980b9;
      color: #fff;
    }

    &.status-shipped {
      background: #9b59b6;
      color: #fff;
    }

    &.status-delivered {
      background: #2ecc71;
      color: #fff;
    }

    &.status-cancelled {
      background: #e74c3c;
      color: #fff;
    }
  }

  .order-header {
    margin-bottom: 2rem;
    padding-right: 12rem; /* space for status badge */

    .order-info h3 {
      font-size: 2rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.8rem;
    }

    .order-date {
      display: block;
      font-size: 1.4rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .order-items-count {
      display: block;
      font-size: 1.4rem;
      color: #888;
      font-weight: 500;
    }
  }

  .grid-four-column {
    display: grid;
    grid-template-columns: 2fr 1fr 0.8fr 1fr;
    text-align: center;
    align-items: center;
    gap: 1rem;
  }

  .cart-heading {
    text-align: center;
    text-transform: uppercase;
    font-size: 1.2rem;
    font-weight: 600;
    color: #555;
    margin-bottom: 1rem;
    padding: 0 1rem;
  }

  hr {
    margin: 1rem 0;
    border: none;
    height: 1px;
    background: #e0e0e0;
  }

  .order-items {
    margin-bottom: 2rem;
  }

  .cart-item {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .cart-image--name {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    text-align: left;

    img {
      max-width: 6rem;
      height: 6rem;
      border-radius: 0.8rem;
      object-fit: contain;
      background: #fafafa;
      padding: 0.5rem;
      border: 1px solid #eee;
    }

    .product-name {
      font-weight: 500;
      font-size: 1.5rem;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.5rem;
    }

    .color-div {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1.2rem;
      color: #666;

      .color-style {
        width: 1.6rem;
        height: 1.6rem;
        border-radius: 50%;
        border: 2px solid #ddd;
      }
    }
  }

  .order-summary {
    border-top: 2px solid #f0f0f0;
    padding-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .order-totals {
    min-width: 25rem;
    background: #fafafa;
    padding: 2rem;
    border-radius: 0.8rem;
    border: 1px solid #eee;

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0;
      font-size: 1.4rem;

      &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
      }

      &.total-final {
        font-weight: 600;
        font-size: 1.6rem;
        color: ${({ theme }) => theme.colors.heading};
        background: #fff;
        margin: 1rem -2rem -2rem -2rem;
        padding: 1.5rem 2rem;
        border-radius: 0 0 0.8rem 0.8rem;
      }
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .orders-header h2 {
      font-size: 2.8rem;
    }

    .order-card {
      padding: 1.5rem 2rem;
    }

    .order-header {
      padding-right: 8rem;
    }

    .order-status {
      font-size: 1rem;
      padding: 0.5rem 1rem;
      top: 1rem;
      right: 1rem;
    }

    .grid-four-column {
      grid-template-columns: 1.5fr 1fr 0.8fr;
    }

    .cart-hide {
      display: none;
    }

    .cart-image--name {
      gap: 1rem;

      img {
        max-width: 5rem;
        height: 5rem;
      }

      .product-name {
        font-size: 1.4rem;
      }
    }

    .order-summary {
      justify-content: center;
    }

    .order-totals {
      min-width: 100%;
    }
  }
`;

export default Orders;