package com.example.demo.security;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("🔍 Loading user details for email: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("❌ User not found with email: " + email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        System.out.println("✅ User found: " + user.getEmail());
        System.out.println("📊 User ID: " + user.getId());

        // Check user's role
        try {
            if (user.getRole() != null) {
                System.out.println("👤 User role: " + user.getRole().name());
            } else {
                System.out.println("⚠️ User has null role - will use default");
            }
        } catch (Exception e) {
            System.out.println("❌ Error checking user role: " + e.getMessage());
        }

        // Create CustomUserDetails
        CustomUserDetails userDetails = new CustomUserDetails(user);
        System.out.println("🔐 Final user authorities: " + userDetails.getAuthorities());

        return userDetails;
    }
}