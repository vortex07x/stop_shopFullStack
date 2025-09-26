// src/main/java/com/example/demo/controller/AuthController.java
package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.UserRegistrationDto;
import com.example.demo.dto.ForgotPasswordRequest;
import com.example.demo.dto.VerifyOtpRequest;
import com.example.demo.dto.ResetPasswordRequest;
import com.example.demo.model.User;
import com.example.demo.model.OtpVerification;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;
import com.example.demo.service.OtpService;
import com.example.demo.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

// Simple response class for API responses
class ApiResponse {
    private boolean success;
    private String message;

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")  // Fixed CORS configuration
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Test endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testAuth() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Auth controller is working!");
        response.put("endpoints", "/register, /login, /forgot-password, /verify-otp, /reset-password");
        return ResponseEntity.ok(response);
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDto dto) {
        try {
            User savedUser = authService.register(dto);

            // Return user info with avatar for immediate use
            LoginResponse response = new LoginResponse(
                    null, // No token on registration, user needs to login
                    savedUser.getEmail(),
                    savedUser.getRole().name(),
                    savedUser.getName(),
                    savedUser.getAvatar()
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Invalid request";

            if (message.contains("Email already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
    }

    // Login user with email & password - now includes avatar
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Invalid credentials";
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
        }
    }

    // Forgot Password - Send OTP to email
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            // Check if user exists
            User user = userService.getUserByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse(false, "No account found with this email address"));
            }

            // Generate OTP
            OtpVerification otpVerification = otpService.createPasswordResetOtp(request.getEmail());

            // Send OTP email
            boolean emailSent = emailService.sendOtpEmail(
                    request.getEmail(),
                    otpVerification.getOtp(),
                    user.getName()
            );

            if (!emailSent) {
                return ResponseEntity.status(500).body(
                        new ApiResponse(false, "Failed to send OTP email. Please try again."));
            }

            return ResponseEntity.ok(new ApiResponse(true, "OTP sent successfully to your email"));

        } catch (Exception e) {
            System.err.println("Error in forgot password: " + e.getMessage());
            return ResponseEntity.status(500).body(
                    new ApiResponse(false, "An error occurred. Please try again."));
        }
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            boolean isValid = otpService.verifyPasswordResetOtp(request.getEmail(), request.getOtp());

            if (isValid) {
                return ResponseEntity.ok(new ApiResponse(true, "OTP verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(
                        new ApiResponse(false, "Invalid or expired OTP"));
            }

        } catch (Exception e) {
            System.err.println("Error verifying OTP: " + e.getMessage());
            return ResponseEntity.status(500).body(
                    new ApiResponse(false, "An error occurred. Please try again."));
        }
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            // Get user
            User user = userService.getUserByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse(false, "User not found"));
            }

            // Encode new password
            String encodedPassword = passwordEncoder.encode(request.getNewPassword());

            // Update user password
            user.setPassword(encodedPassword);
            userService.save(user); // Make sure your UserService has a save method

            // Clean up OTPs for this user
            otpService.cleanupUserOtps(request.getEmail());

            // Send confirmation email
            emailService.sendPasswordResetConfirmation(request.getEmail(), user.getName());

            return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully"));

        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            return ResponseEntity.status(500).body(
                    new ApiResponse(false, "An error occurred. Please try again."));
        }
    }
}