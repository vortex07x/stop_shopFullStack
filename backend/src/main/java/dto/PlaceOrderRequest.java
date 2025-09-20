package com.example.demo.dto;

import java.util.List;

public class PlaceOrderRequest {
    private List<CartItemDto> cartItems;
    private Double subtotal;
    private Double shippingFee;
    private Double orderTotal;

    // Default constructor
    public PlaceOrderRequest() {}

    // Parameterized constructor
    public PlaceOrderRequest(List<CartItemDto> cartItems, Double subtotal, Double shippingFee, Double orderTotal) {
        this.cartItems = cartItems;
        this.subtotal = subtotal;
        this.shippingFee = shippingFee;
        this.orderTotal = orderTotal;
    }

    // Add missing isValid() method
    public boolean isValid() {
        // Check if basic fields are not null and valid
        if (cartItems == null || cartItems.isEmpty()) {
            return false;
        }

        if (subtotal == null || subtotal < 0) {
            return false;
        }

        if (shippingFee == null || shippingFee < 0) {
            return false;
        }

        if (orderTotal == null || orderTotal <= 0) {
            return false;
        }

        // Validate that order total makes sense
        double calculatedTotal = subtotal + shippingFee;
        if (Math.abs(orderTotal - calculatedTotal) > 0.01) { // Allow small floating point differences
            return false;
        }

        // Validate all cart items
        for (CartItemDto item : cartItems) {
            if (item == null || !item.isValid()) {
                return false;
            }
        }

        return true;
    }

    // Getters and Setters
    public List<CartItemDto> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemDto> cartItems) {
        this.cartItems = cartItems;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public Double getOrderTotal() {
        return orderTotal;
    }

    public void setOrderTotal(Double orderTotal) {
        this.orderTotal = orderTotal;
    }
}