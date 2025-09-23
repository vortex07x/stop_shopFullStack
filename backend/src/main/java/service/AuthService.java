package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.UserRegistrationDto;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    @Lazy // Use @Lazy to break potential circular dependency
    private UserService userService;

    /**
     * Register a new user with default role = USER
     */
    public User register(UserRegistrationDto dto) {
        System.out.println("Registering user with email: " + dto.getEmail());

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Build the full name from the DTO
        String fullName = "";
        if (dto.getFirstName() != null && dto.getLastName() != null) {
            fullName = dto.getFirstName() + " " + dto.getLastName();
        } else if (dto.getName() != null) {
            fullName = dto.getName();
        } else if (dto.getFirstName() != null) {
            fullName = dto.getFirstName();
        }

        // Generate initial avatar for the user
        String initialAvatar = userService.generateRandomAvatar(dto.getEmail());

        // Create user using builder pattern
        User user = User.builder()
                .name(fullName) // Use single name field to match database
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.USER) // default role
                .avatar(initialAvatar) // Set initial avatar
                .build();

        User savedUser = userRepository.save(user);
        System.out.println("User registered successfully: " + savedUser.getEmail());
        System.out.println("User avatar set to: " + savedUser.getAvatar());

        return savedUser;
    }

    /**
     * Login user and return JWT token with user name and avatar
     */
    public LoginResponse login(LoginRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("User not found: " + request.getEmail());
                    return new IllegalArgumentException("Invalid email or password");
                });

        System.out.println("User found: " + user.getEmail());
        System.out.println("User name from DB: " + user.getName()); // Debug log
        System.out.println("User avatar from DB: " + user.getAvatar()); // Debug log

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            System.out.println("Password mismatch for user: " + request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }

        System.out.println("Password verified for user: " + user.getEmail());

        // If user doesn't have an avatar, generate one
        if (user.getAvatar() == null || user.getAvatar().trim().isEmpty()) {
            String newAvatar = userService.generateRandomAvatar(user.getEmail());
            user.setAvatar(newAvatar);
            userRepository.save(user); // Save the updated user with avatar
            System.out.println("Generated new avatar for existing user: " + newAvatar);
        }

        // Create UserDetails and generate token
        UserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);

        System.out.println("JWT token generated for user: " + user.getEmail());
        System.out.println("User role: " + user.getRole());

        // Return response with user name and avatar included
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole().name(), // Convert enum to string
                user.getName(),        // Include the user's name from database
                user.getAvatar()       // Include the user's avatar from database
        );
    }
}