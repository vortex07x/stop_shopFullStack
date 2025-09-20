// Fixed OrderItemRepository.java - THIS WAS THE MAIN PROBLEM
package com.example.demo.repository;

import com.example.demo.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // FIXED: Use order.id instead of orderId
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    // This was already correct
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId ORDER BY oi.order.createdAt DESC")
    List<OrderItem> findByUserId(@Param("userId") Long userId);

    // FIXED: Use order.id instead of orderId
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.id = :orderId")
    long countByOrderId(@Param("orderId") Long orderId);

    // This can stay as method name since productName exists as a field
    List<OrderItem> findByProductNameContaining(String productName);

    // These were already correct with @Query
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.order.id = :orderId")
    Integer getTotalQuantityByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT COALESCE(SUM(oi.price * oi.quantity), 0.0) FROM OrderItem oi WHERE oi.order.id = :orderId")
    Double getTotalValueByOrderId(@Param("orderId") Long orderId);

    // This can stay as method name since color exists as a field
    List<OrderItem> findByColor(String color);

    // This was already correct
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId ORDER BY oi.order.createdAt DESC")
    List<OrderItem> findRecentItemsByUserId(@Param("userId") Long userId);
}