package com.example.demo.controller;

import com.example.demo.dto.PlaceOrderRequest;
import com.example.demo.model.Order;
import com.example.demo.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    // Get all orders for the authenticated user
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Order> orders = orderService.getOrdersByEmail(email);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Error fetching orders: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Place a new order from cart items
    @PostMapping("/place-order")
    public ResponseEntity<Order> placeOrder(@RequestBody PlaceOrderRequest request,
                                            Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("📦 Placing order for user: " + email);
            System.out.println("📦 Order details: " + request.getCartItems().size() + " items, Total: $" + request.getOrderTotal());

            Order order = orderService.createOrderFromCart(request, email);
            System.out.println("✅ Order created successfully with ID: " + order.getId());

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("❌ Error placing order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Update order status (for admin or user)
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId,
                                                   @RequestParam String status,
                                                   Authentication authentication) {
        try {
            String email = authentication.getName();
            Order updatedOrder = orderService.updateOrderStatus(orderId, status, email);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Get specific order details
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Long orderId,
                                                 Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Order> userOrders = orderService.getOrdersByEmail(email);

            Order order = userOrders.stream()
                    .filter(o -> o.getId().equals(orderId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Order not found or doesn't belong to user"));

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("Error fetching order details: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}