// src/main/java/com/example/demo/service/AdminService.java
package com.example.demo.service;

import com.example.demo.model.Order;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // Get total users count
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);

        // Get total orders count
        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);

        // Calculate total revenue from orders
        Double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(Order::getOrderTotal)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        // For now, we'll set products to 0 since we don't have a products table yet
        stats.put("totalProducts", 0);

        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate role
        Role newRole;
        try {
            newRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }

        user.setRole(newRole);
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent deleting the last admin
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user");
            }
        }

        userRepository.deleteById(userId);
    }

    public List<Map<String, Object>> getAllOrdersWithDetails() {
        List<Order> orders = orderRepository.findAllWithOrderItems();

        return orders.stream().map(order -> {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.getId());
            orderMap.put("userId", order.getUser().getId());
            orderMap.put("userName", order.getUser().getName());
            orderMap.put("userEmail", order.getUser().getEmail());
            orderMap.put("totalAmount", order.getOrderTotal());
            orderMap.put("status", order.getStatus());
            orderMap.put("createdAt", order.getCreatedAt());
            orderMap.put("subtotal", order.getSubtotal());
            orderMap.put("shippingFee", order.getShippingFee());

            // Add order items
            List<Map<String, Object>> items = order.getItems().stream()
                    .map(item -> {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("id", item.getId());
                        itemMap.put("productName", item.getProductName());
                        itemMap.put("quantity", item.getQuantity());
                        itemMap.put("price", item.getPrice());
                        return itemMap;
                    })
                    .collect(Collectors.toList());
            orderMap.put("items", items);

            return orderMap;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate status - you can add more validation as needed
        List<String> validStatuses = List.of("pending", "processing", "shipped", "delivered", "cancelled");
        if (!validStatuses.contains(status.toLowerCase())) {
            throw new RuntimeException("Invalid order status: " + status);
        }

        // Store previous status for email notification
        String previousStatus = order.getStatus();

        // Update the order status
        order.setStatus(status.toLowerCase());
        Order savedOrder = orderRepository.save(order);

        // Send email notification to customer about status change
        try {
            User customer = savedOrder.getUser();
            emailService.sendOrderStatusUpdateEmail(
                    customer.getEmail(),
                    customer.getName(),
                    savedOrder,
                    previousStatus,
                    status.toLowerCase()
            );
        } catch (Exception e) {
            // Log the error but don't fail the order update
            System.err.println("Failed to send order status update email for order " + orderId + ": " + e.getMessage());
        }
    }
}