package com.example.demo.controller;

import com.example.demo.dto.CartItemDto;
import com.example.demo.model.CartItem;
import com.example.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    @GetMapping("/my")
    public ResponseEntity<List<CartItemDto>> getMyCart(Authentication auth) {
        System.out.println("🛒 Getting cart for user: " + (auth != null ? auth.getName() : "null"));

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<CartItemDto> cartItems = cartService.getMyCart();
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            System.out.println("❌ Error getting cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request, Authentication auth) {
        System.out.println("🛒 Add to cart request received");
        System.out.println("👤 Authentication: " + (auth != null ? auth.getName() : "null"));
        System.out.println("📦 Request body: " + request);

        // Check authentication
        if (auth == null) {
            System.out.println("❌ No authentication found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            // Extract data from request with proper type handling
            Object productIdObj = request.get("productId");
            String color = (String) request.get("color");
            Object quantityObj = request.get("quantity");
            Object priceObj = request.get("price");
            String productName = (String) request.get("productName");
            String productImage = (String) request.get("productImage");

            System.out.println("📊 Raw data - ProductId: " + productIdObj + ", Color: " + color +
                    ", Quantity: " + quantityObj + ", Price: " + priceObj);

            // Validate required fields
            if (productIdObj == null || color == null || quantityObj == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing required fields: productId, color, quantity"));
            }

            // Handle productId conversion
            Long productId;
            if (productIdObj instanceof String) {
                String productIdStr = (String) productIdObj;
                try {
                    if (productIdStr.matches("\\d+")) {
                        productId = Long.parseLong(productIdStr);
                    } else {
                        // For string IDs, convert to positive long using abs of hashCode
                        productId = Math.abs((long) productIdStr.hashCode());
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid productId format"));
                }
            } else if (productIdObj instanceof Number) {
                productId = ((Number) productIdObj).longValue();
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid productId type"));
            }

            // Handle quantity conversion
            Integer quantity;
            if (quantityObj instanceof Number) {
                quantity = ((Number) quantityObj).intValue();
            } else if (quantityObj instanceof String) {
                try {
                    quantity = Integer.parseInt((String) quantityObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid quantity format"));
                }
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid quantity type"));
            }

            // Handle price conversion with default fallback
            Double price = 100.0; // Default price
            if (priceObj != null) {
                if (priceObj instanceof Number) {
                    price = ((Number) priceObj).doubleValue();
                } else if (priceObj instanceof String) {
                    try {
                        price = Double.parseDouble((String) priceObj);
                    } catch (NumberFormatException e) {
                        System.out.println("⚠️ Invalid price format, using default: " + price);
                    }
                }
            }

            // Set default values if not provided
            if (productName == null || productName.trim().isEmpty()) {
                productName = "Product " + productId;
            }
            if (productImage == null || productImage.trim().isEmpty()) {
                productImage = "default-product.jpg";
            }

            System.out.println("📊 Parsed data - ProductId: " + productId + ", Color: " + color +
                    ", Quantity: " + quantity + ", Price: " + price);

            // Validate quantity
            if (quantity <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Quantity must be greater than 0"));
            }

            // Call the service with the correct data types
            CartItemDto cartItem = cartService.addToCart(
                    productId,
                    productName,
                    productImage,
                    color,
                    quantity,
                    price
            );

            System.out.println("✅ Cart item added successfully with ID: " + cartItem.getId());
            return ResponseEntity.ok(cartItem);

        } catch (RuntimeException e) {
            System.out.println("❌ Runtime error adding to cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add item to cart: " + e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Map<String, String>> removeCartItem(@PathVariable Long cartItemId, Authentication auth) {
        System.out.println("🗑️ Remove cart item request - ID: " + cartItemId);
        System.out.println("👤 Authentication: " + (auth != null ? auth.getName() : "null"));

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            cartService.removeCartItem(cartItemId);
            System.out.println("✅ Cart item removed successfully: " + cartItemId);
            return ResponseEntity.ok(Map.of("message", "Item removed from cart successfully"));
        } catch (RuntimeException e) {
            System.out.println("❌ Error removing cart item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Internal error removing cart item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove item from cart"));
        }
    }

    @PutMapping("/update-quantity")
    public ResponseEntity<?> updateCartItemQuantity(@RequestBody Map<String, Object> request, Authentication auth) {
        System.out.println("📝 Update quantity request received");
        System.out.println("👤 Authentication: " + (auth != null ? auth.getName() : "null"));
        System.out.println("📦 Request body: " + request);

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            // Extract and validate cartItemId
            Object cartItemIdObj = request.get("cartItemId");
            Object quantityObj = request.get("quantity");

            if (cartItemIdObj == null || quantityObj == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing required fields: cartItemId, quantity"));
            }

            // Handle cartItemId conversion
            Long cartItemId;
            if (cartItemIdObj instanceof Number) {
                cartItemId = ((Number) cartItemIdObj).longValue();
            } else if (cartItemIdObj instanceof String) {
                try {
                    cartItemId = Long.parseLong((String) cartItemIdObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid cartItemId format"));
                }
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid cartItemId type"));
            }

            // Handle quantity conversion
            Integer quantity;
            if (quantityObj instanceof Number) {
                quantity = ((Number) quantityObj).intValue();
            } else if (quantityObj instanceof String) {
                try {
                    quantity = Integer.parseInt((String) quantityObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid quantity format"));
                }
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid quantity type"));
            }

            // Validate quantity
            if (quantity <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Quantity must be greater than 0"));
            }

            System.out.println("📊 Parsed data - CartItemId: " + cartItemId + ", Quantity: " + quantity);

            CartItemDto updatedItem = cartService.updateCartItemQuantity(cartItemId, quantity);
            System.out.println("✅ Cart item quantity updated successfully");
            return ResponseEntity.ok(updatedItem);

        } catch (RuntimeException e) {
            System.out.println("❌ Runtime error updating quantity: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Error updating cart item quantity: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update cart item quantity"));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCart(Authentication auth) {
        System.out.println("🗑️ Clearing cart for user: " + (auth != null ? auth.getName() : "null"));

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        try {
            cartService.clearCart();
            return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
        } catch (Exception e) {
            System.out.println("❌ Error clearing cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear cart"));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAuth(Authentication auth) {
        System.out.println("🔍 Testing authentication");

        if (auth == null) {
            System.out.println("❌ No authentication found in test endpoint");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "authenticated", false,
                            "message", "No authentication found",
                            "user", "null"
                    ));
        }

        System.out.println("✅ Authentication found in test endpoint: " + auth.getName());
        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "user", auth.getName(),
                "authorities", auth.getAuthorities().toString(),
                "message", "Authentication successful"
        ));
    }
}