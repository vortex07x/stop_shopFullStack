package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 50)
    private String status; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    @Column(name = "shipping_fee", nullable = false)
    private Double shippingFee;

    @Column(name = "order_total", nullable = false)
    private Double orderTotal;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // This prevents circular reference
    private List<OrderItem> items;

    // Calculated method for total items count
    public int getTotalItems() {
        return items != null ? items.stream().mapToInt(OrderItem::getQuantity).sum() : 0;
    }

    // Helper method to avoid lazy loading issues in JSON serialization
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", createdAt=" + createdAt +
                ", status='" + status + '\'' +
                ", subtotal=" + subtotal +
                ", shippingFee=" + shippingFee +
                ", orderTotal=" + orderTotal +
                ", itemsCount=" + (items != null ? items.size() : 0) +
                '}';
    }
}