package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Find orders by user ID ordered by creation date
    // Fixed: Use user_id (underscore) instead of userId (camelCase)
    List<Order> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // Find orders by user ID and status
    // Fixed: Use user_id (underscore) instead of userId (camelCase)
    List<Order> findByUser_IdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    // Count orders by user ID
    // Fixed: Use user_id (underscore) instead of userId (camelCase)
    long countByUser_Id(Long userId);

    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    // Delete order and its items (handles foreign key constraint)
    @Transactional
    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.order.id = :orderId")
    void deleteOrderItemsByOrderId(@Param("orderId") Long orderId);

    // Custom method to safely delete an order with its items
    @Transactional
    default void safeDeleteById(Long orderId) {
        // First delete all order items
        deleteOrderItemsByOrderId(orderId);
        // Then delete the order
        deleteById(orderId);
    }

    // Delete all orders for a user (and their items)
    @Transactional
    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.order.user.id = :userId")
    void deleteOrderItemsByUserId(@Param("userId") Long userId);

    @Transactional
    default void safeDeleteByUserId(Long userId) {
        // First delete all order items for the user
        deleteOrderItemsByUserId(userId);
        // Then delete all orders for the user
        deleteByUser_Id(userId);
    }

    // Delete orders by user ID (used by safeDeleteByUserId)
    // Fixed: Use user_id (underscore) instead of userId (camelCase)
    void deleteByUser_Id(Long userId);

    // New method for admin functionality to fetch orders with order items
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.user ORDER BY o.createdAt DESC")
    List<Order> findAllWithOrderItems();
}