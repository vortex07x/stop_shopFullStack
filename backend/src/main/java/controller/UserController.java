// UserController.java
package com.example.demo.controller;

import com.example.demo.dto.AvatarUpdateRequest;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import com.example.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    // Get current user's profile including avatar
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            String email = jwtService.extractUsername(token);
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId());
            userProfile.put("email", user.getEmail());
            userProfile.put("name", user.getName());
            userProfile.put("avatar", user.getAvatar());
            userProfile.put("role", user.getRole().name());

            return ResponseEntity.ok(userProfile);

        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            return ResponseEntity.status(500).body("Error fetching profile");
        }
    }

    // Get current user's avatar
    @GetMapping("/avatar")
    public ResponseEntity<?> getUserAvatar(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            String email = jwtService.extractUsername(token);
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            Map<String, String> response = new HashMap<>();
            response.put("avatar", user.getAvatar());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error fetching user avatar: " + e.getMessage());
            return ResponseEntity.status(500).body("Error fetching avatar");
        }
    }

    // Update current user's avatar
    @PutMapping("/avatar")
    public ResponseEntity<?> updateUserAvatar(@RequestBody AvatarUpdateRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            String email = jwtService.extractUsername(token);
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            // Update avatar
            user.setAvatar(request.getAvatar());
            userService.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Avatar updated successfully");
            response.put("avatar", user.getAvatar());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error updating user avatar: " + e.getMessage());
            return ResponseEntity.status(500).body("Error updating avatar");
        }
    }

    // Generate a new random avatar for current user
    @PostMapping("/avatar/generate")
    public ResponseEntity<?> generateNewAvatar(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            String email = jwtService.extractUsername(token);
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            // Generate new avatar URL
            String newAvatar = userService.generateRandomAvatar(user.getEmail());
            user.setAvatar(newAvatar);
            userService.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "New avatar generated successfully");
            response.put("avatar", newAvatar);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error generating new avatar: " + e.getMessage());
            return ResponseEntity.status(500).body("Error generating avatar");
        }
    }

    // Helper method to extract JWT token from request
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}