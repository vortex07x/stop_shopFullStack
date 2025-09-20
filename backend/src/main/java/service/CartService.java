package com.example.demo.service;

import com.example.demo.dto.CartItemDto;
import com.example.demo.model.CartItem;
import com.example.demo.model.User;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔍 Authentication object: " + auth);
        System.out.println("🔍 Authentication name: " + (auth != null ? auth.getName() : "null"));
        System.out.println("🔍 Authentication principal: " + (auth != null ? auth.getPrincipal() : "null"));

        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authentication found");
        }

        // Try to get User from CustomUserDetails first
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            User user = userDetails.getUser();
            System.out.println("✅ Got user from CustomUserDetails: " + user.getEmail());
            return user;
        }

        // Fallback: find by email
        String email = auth.getName();
        System.out.println("🔍 Looking up user by email: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("❌ User not found with email: " + email);
                    return new RuntimeException("User not found with email: " + email);
                });

        System.out.println("✅ Found user: " + user.getEmail() + " with ID: " + user.getId());
        return user;
    }

    // Convert CartItem entity to DTO - FIXED VERSION (removed created_at)
    private CartItemDto convertToDto(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        CartItemDto dto = new CartItemDto();
        dto.setId(cartItem.getId());
        dto.setProductId(cartItem.getProductId());
        dto.setProductName(cartItem.getProductName());
        dto.setProductImage(cartItem.getProductImage());
        dto.setColor(cartItem.getColor());
        dto.setQuantity(cartItem.getQuantity());
        dto.setPrice(cartItem.getPrice());
        // Removed: dto.setCreatedAt(cartItem.getCreatedAt());

        if (cartItem.getUser() != null) {
            dto.setUserId(cartItem.getUser().getId());
            dto.setUserEmail(cartItem.getUser().getEmail());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<CartItemDto> getMyCart() {
        try {
            User user = getCurrentUser();
            System.out.println("👤 Getting cart for user: " + user.getEmail() + " (ID: " + user.getId() + ")");

            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            System.out.println("📦 Found " + cartItems.size() + " items in cart");

            return cartItems.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("❌ Error getting cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get cart: " + e.getMessage());
        }
    }

    public CartItemDto addToCart(Long productId, String productName, String productImage,
                                 String color, int quantity, double price) {
        try {
            User user = getCurrentUser();
            System.out.println("👤 Adding to cart for user: " + user.getEmail() + " (ID: " + user.getId() + ")");
            System.out.println("📦 Product details - ID: " + productId + ", Name: " + productName +
                    ", Color: " + color + ", Quantity: " + quantity + ", Price: " + price);

            // Validate inputs
            if (productId == null) {
                throw new RuntimeException("Product ID cannot be null");
            }
            if (color == null || color.trim().isEmpty()) {
                throw new RuntimeException("Color cannot be null or empty");
            }
            if (quantity <= 0) {
                throw new RuntimeException("Quantity must be greater than 0");
            }
            if (price < 0) {
                throw new RuntimeException("Price cannot be negative");
            }

            // Check if item already exists in cart
            CartItem cartItem = cartItemRepository.findByUserAndProductIdAndColor(user, productId, color)
                    .map(existing -> {
                        System.out.println("📦 Found existing cart item with ID: " + existing.getId());
                        System.out.println("📦 Updating quantity from " + existing.getQuantity() + " to " + (existing.getQuantity() + quantity));
                        existing.setQuantity(existing.getQuantity() + quantity);
                        existing.setPrice(price);
                        existing.setProductName(productName);
                        existing.setProductImage(productImage);
                        return cartItemRepository.save(existing);
                    })
                    .orElseGet(() -> {
                        System.out.println("📦 Creating new cart item");
                        CartItem newItem = new CartItem();
                        newItem.setUser(user);
                        newItem.setProductId(productId);
                        newItem.setProductName(productName);
                        newItem.setProductImage(productImage);
                        newItem.setColor(color);
                        newItem.setQuantity(quantity);
                        newItem.setPrice(price);
                        return cartItemRepository.save(newItem);
                    });

            System.out.println("✅ Cart item saved with ID: " + cartItem.getId());

            // Verify the save was successful
            CartItem savedItem = cartItemRepository.findById(cartItem.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to save cart item"));

            System.out.println("✅ Verified cart item exists in database");
            return convertToDto(savedItem);

        } catch (Exception e) {
            System.out.println("❌ Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to add item to cart: " + e.getMessage());
        }
    }

    public void removeCartItem(Long cartItemId) {
        try {
            User currentUser = getCurrentUser();
            System.out.println("🗑️ Removing cart item with ID: " + cartItemId + " for user: " + currentUser.getEmail());

            CartItem cartItem = cartItemRepository.findById(cartItemId)
                    .orElseThrow(() -> {
                        System.out.println("❌ Cart item not found with ID: " + cartItemId);
                        return new RuntimeException("Cart item not found");
                    });

            if (!cartItem.getUser().getId().equals(currentUser.getId())) {
                System.out.println("❌ Unauthorized access attempt - cart item belongs to different user");
                throw new RuntimeException("Unauthorized: Cart item belongs to different user");
            }

            System.out.println("✅ Cart item found and ownership verified. Deleting...");
            cartItemRepository.delete(cartItem);

            if (cartItemRepository.existsById(cartItemId)) {
                System.out.println("❌ Cart item still exists after deletion attempt");
                throw new RuntimeException("Failed to delete cart item from database");
            }

            System.out.println("✅ Cart item deleted successfully");

        } catch (Exception e) {
            System.out.println("❌ Error removing cart item: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to remove cart item: " + e.getMessage());
        }
    }

    public CartItemDto updateCartItemQuantity(Long cartItemId, int newQuantity) {
        try {
            User currentUser = getCurrentUser();
            System.out.println("📝 Updating quantity for cart item ID: " + cartItemId +
                    " to: " + newQuantity + " for user: " + currentUser.getEmail());

            if (newQuantity <= 0) {
                throw new RuntimeException("Quantity must be greater than 0");
            }

            CartItem cartItem = cartItemRepository.findById(cartItemId)
                    .orElseThrow(() -> {
                        System.out.println("❌ Cart item not found with ID: " + cartItemId);
                        return new RuntimeException("Cart item not found");
                    });

            if (!cartItem.getUser().getId().equals(currentUser.getId())) {
                System.out.println("❌ Unauthorized access attempt - cart item belongs to different user");
                throw new RuntimeException("Unauthorized: Cart item belongs to different user");
            }

            System.out.println("✅ Cart item found and ownership verified. Updating quantity from " +
                    cartItem.getQuantity() + " to " + newQuantity);

            cartItem.setQuantity(newQuantity);
            CartItem updatedCartItem = cartItemRepository.save(cartItem);

            System.out.println("✅ Cart item quantity updated successfully");

            CartItem verifiedItem = cartItemRepository.findById(cartItemId)
                    .orElseThrow(() -> new RuntimeException("Cart item lost after update"));

            if (verifiedItem.getQuantity() != newQuantity) {
                System.out.println("❌ Quantity update verification failed");
                throw new RuntimeException("Failed to update quantity in database");
            }

            return convertToDto(verifiedItem);

        } catch (Exception e) {
            System.out.println("❌ Error updating cart item quantity: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update cart item quantity: " + e.getMessage());
        }
    }

    public void clearCart() {
        try {
            User user = getCurrentUser();
            System.out.println("🗑️ Clearing cart for user: " + user.getEmail() + " (ID: " + user.getId() + ")");

            List<CartItem> userCartItems = cartItemRepository.findByUser(user);
            System.out.println("🗑️ Found " + userCartItems.size() + " items to delete");

            cartItemRepository.deleteAll(userCartItems);
            System.out.println("✅ Cart cleared successfully");

        } catch (Exception e) {
            System.out.println("❌ Error clearing cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to clear cart: " + e.getMessage());
        }
    }

    @Transactional
    public void clearCartForUser(String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            System.out.println("🗑️ Clearing cart for user: " + user.getEmail() + " (ID: " + user.getId() + ")");

            List<CartItem> userCartItems = cartItemRepository.findByUser(user);
            System.out.println("🗑️ Found " + userCartItems.size() + " items to delete");

            cartItemRepository.deleteAll(userCartItems);
            System.out.println("✅ Cart cleared successfully for user: " + email);

        } catch (Exception e) {
            System.out.println("❌ Error clearing cart for user " + email + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to clear cart for user: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public int getCartItemCount() {
        try {
            User user = getCurrentUser();
            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            return cartItems.stream().mapToInt(CartItem::getQuantity).sum();
        } catch (Exception e) {
            System.out.println("❌ Error getting cart count: " + e.getMessage());
            return 0;
        }
    }
}