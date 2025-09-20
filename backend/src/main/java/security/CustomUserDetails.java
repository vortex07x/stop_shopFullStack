package com.example.demo.security;

import com.example.demo.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        try {
            // ✅ Safe handling of role with null checks
            if (user.getRole() != null) {
                String roleName = user.getRole().name(); // Assuming it's an enum
                String roleWithPrefix = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                System.out.println("🔐 User role from database: " + roleWithPrefix);
                return List.of(new SimpleGrantedAuthority(roleWithPrefix));
            }
        } catch (Exception e) {
            System.out.println("❌ Error getting user role: " + e.getMessage());
            e.printStackTrace();
        }

        // ✅ Fallback to default role if anything goes wrong
        System.out.println("🔐 Using default ROLE_USER (fallback)");
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // Since you're using email for authentication, return email as username
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Helper method to get the actual User entity
    public User getUser() {
        return user;
    }
}