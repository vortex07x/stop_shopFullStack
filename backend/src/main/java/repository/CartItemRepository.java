// Fixed CartItemRepository.java
package com.example.demo.repository;

import com.example.demo.model.CartItem;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser(User user);

    // Fixed method with @Query to avoid parsing issues
    @Query("SELECT c FROM CartItem c WHERE c.user = :user AND c.productId = :productId AND c.color = :color")
    Optional<CartItem> findByUserAndProductIdAndColor(@Param("user") User user,
                                                      @Param("productId") Long productId,
                                                      @Param("color") String color);
}