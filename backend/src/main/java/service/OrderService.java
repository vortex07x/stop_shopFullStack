package com.example.demo.service;

import com.example.demo.dto.CartItemDto;
import com.example.demo.dto.PlaceOrderRequest;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.User;
import com.example.demo.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserService userService;
    private final CartService cartService;
    private final EmailService emailService; // NEW: Added EmailService dependency

    // Find orders by user email
    public List<Order> getOrdersByEmail(String email) {
        try {
            User user = userService.getUserByEmail(email);
            // Fixed: Updated method name to use underscore
            List<Order> orders = orderRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

            // Log the fetched orders for debugging
            System.out.println("Fetched " + orders.size() + " orders for user: " + email);

            return orders;
        } catch (Exception e) {
            System.err.println("Error fetching orders for user " + email + ": " + e.getMessage());
            throw new RuntimeException("Failed to fetch orders: " + e.getMessage());
        }
    }

    // Create order from cart items with enhanced validation and error handling
    @Transactional
    public Order createOrderFromCart(PlaceOrderRequest request, String email) {
        try {
            // Validate request
            if (request == null) {
                throw new IllegalArgumentException("Order request cannot be null");
            }

            if (!request.isValid()) {
                throw new IllegalArgumentException("Invalid order request data");
            }

            // Validate cart items
            if (request.getCartItems() == null || request.getCartItems().isEmpty()) {
                throw new IllegalArgumentException("Cart items cannot be empty");
            }

            // Validate all cart items
            for (CartItemDto cartItem : request.getCartItems()) {
                if (!cartItem.isValid()) {
                    throw new IllegalArgumentException("Invalid cart item: " + cartItem);
                }
            }

            User user = userService.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found: " + email);
            }

            System.out.println("Creating order for user: " + email + " with " + request.getCartItems().size() + " items");

            // Create new order
            Order order = new Order();
            order.setUser(user);
            order.setStatus("ORDERED"); // Set status as ORDERED when order is placed
            order.setSubtotal(request.getSubtotal());
            order.setShippingFee(request.getShippingFee());
            order.setOrderTotal(request.getOrderTotal());

            // Create order items from cart items
            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItemDto cartItem : request.getCartItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductName(cartItem.getProductName());
                orderItem.setProductImage(cartItem.getProductImage());
                orderItem.setColor(cartItem.getColor());
                orderItem.setPrice(cartItem.getPrice());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setOrder(order); // Set bidirectional relationship
                orderItems.add(orderItem);
            }

            order.setItems(orderItems);

            // Save order (this will also save order items due to cascade)
            Order savedOrder = orderRepository.save(order);

            System.out.println("Order saved with ID: " + savedOrder.getId());
            System.out.println("Order items count: " + (savedOrder.getItems() != null ? savedOrder.getItems().size() : 0));

            // NEW: Send order confirmation email
            try {
                boolean emailSent = emailService.sendOrderConfirmationEmail(
                        user.getEmail(),
                        user.getName(),
                        savedOrder
                );

                if (emailSent) {
                    System.out.println("✅ Order confirmation email sent successfully to: " + user.getEmail());
                } else {
                    System.err.println("⚠️ Failed to send order confirmation email to: " + user.getEmail());
                    // Don't throw exception here - order should still be successful even if email fails
                }
            } catch (Exception emailException) {
                System.err.println("⚠️ Exception while sending order confirmation email: " + emailException.getMessage());
                // Log the exception but don't fail the order process
                emailException.printStackTrace();
            }

            // Don't clear cart - items should remain for user to continue shopping
            // User can manually clear cart if they want
            System.out.println("Order placed successfully. Cart items preserved for continued shopping.");

            return savedOrder;

        } catch (IllegalArgumentException e) {
            System.err.println("Validation error in createOrderFromCart: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in createOrderFromCart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    // Update order status with validation
    public Order updateOrderStatus(Long orderId, String status, String email) {
        try {
            if (orderId == null) {
                throw new IllegalArgumentException("Order ID cannot be null");
            }

            if (status == null || status.trim().isEmpty()) {
                throw new IllegalArgumentException("Status cannot be null or empty");
            }

            // Validate status
            String normalizedStatus = status.toUpperCase().trim();
            if (!isValidStatus(normalizedStatus)) {
                throw new IllegalArgumentException("Invalid order status: " + status);
            }

            User user = userService.getUserByEmail(email);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

            // Ensure user owns this order
            if (!order.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to update this order");
            }

            System.out.println("Updating order " + orderId + " status from " + order.getStatus() + " to " + normalizedStatus);

            order.setStatus(normalizedStatus);
            Order updatedOrder = orderRepository.save(order);

            System.out.println("Order status updated successfully");
            return updatedOrder;

        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            throw e;
        }
    }

    // Get specific order by ID with user validation
    public Order getOrderById(Long orderId, String email) {
        try {
            if (orderId == null) {
                throw new IllegalArgumentException("Order ID cannot be null");
            }

            User user = userService.getUserByEmail(email);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

            // Ensure user owns this order
            if (!order.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to view this order");
            }

            return order;

        } catch (Exception e) {
            System.err.println("Error fetching order by ID: " + e.getMessage());
            throw e;
        }
    }

    // Helper method to validate order status
    private boolean isValidStatus(String status) {
        return status.equals("ORDERED") ||     // Initial status when order is placed
                status.equals("CONFIRMED") ||  // When merchant confirms the order
                status.equals("SHIPPED") ||    // When order is shipped
                status.equals("DELIVERED") ||  // When order is delivered
                status.equals("CANCELLED");    // When order is cancelled
    }
}