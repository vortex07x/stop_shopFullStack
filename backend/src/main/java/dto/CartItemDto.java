package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String color;
    private Double price;
    private Integer quantity;
    private Long userId;
    private String userEmail;

    // Constructor for convenience
    public CartItemDto(String productName, String productImage, String color,
                       Double price, Integer quantity) {
        this.productName = productName;
        this.productImage = productImage;
        this.color = color;
        this.price = price;
        this.quantity = quantity;
    }

    // Calculated field
    public Double getItemTotal() {
        return price != null && quantity != null ? price * quantity : 0.0;
    }

    // Validation method
    public boolean isValid() {
        if (productName == null || productName.trim().isEmpty()) {
            return false;
        }
        if (price == null || price <= 0) {
            return false;
        }
        if (quantity == null || quantity <= 0) {
            return false;
        }
        if (color == null || color.trim().isEmpty()) {
            return false;
        }
        if (productImage != null && productImage.trim().isEmpty()) {
            return false;
        }
        return true;
    }
}