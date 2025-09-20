// UserService.java
package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Avatar generation services from DiceBear API
    private final List<String> avatarServices = Arrays.asList(
            "avataaars", "adventurer", "big-smile", "bottts", "croodles",
            "fun-emoji", "icons", "identicon", "initials", "lorelei",
            "micah", "miniavs", "personas", "pixel-art", "shapes"
    );

    /**
     * Find user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Save user
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Generate a random avatar URL using DiceBear API
     */
    public String generateRandomAvatar(String email) {
        Random random = new Random();
        String randomService = avatarServices.get(random.nextInt(avatarServices.size()));

        // Use email + current timestamp for uniqueness
        String seed = email + System.currentTimeMillis();

        // Generate avatar URL
        return String.format(
                "https://api.dicebear.com/7.x/%s/svg?seed=%s&size=200&backgroundColor=f1f3f5,e0e3e6,d4d6d9",
                randomService,
                java.net.URLEncoder.encode(seed, java.nio.charset.StandardCharsets.UTF_8)
        );
    }

    /**
     * Generate a deterministic avatar based on email only (for consistency)
     */
    public String generateDeterministicAvatar(String email) {
        // Use email hash to pick a consistent service
        int serviceIndex = Math.abs(email.hashCode()) % avatarServices.size();
        String service = avatarServices.get(serviceIndex);

        return String.format(
                "https://api.dicebear.com/7.x/%s/svg?seed=%s&size=200&backgroundColor=f1f3f5,e0e3e6,d4d6d9",
                service,
                java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8)
        );
    }

    /**
     * Update user avatar
     */
    public User updateUserAvatar(String email, String avatarUrl) {
        User user = getUserByEmail(email);
        if (user != null) {
            user.setAvatar(avatarUrl);
            return save(user);
        }
        throw new RuntimeException("User not found with email: " + email);
    }

    /**
     * Generate and save a new random avatar for user
     */
    public User shuffleUserAvatar(String email) {
        String newAvatar = generateRandomAvatar(email);
        return updateUserAvatar(email, newAvatar);
    }

    /**
     * Get all users (if needed for admin functionality)
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Find user by ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    /**
     * Delete user
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}