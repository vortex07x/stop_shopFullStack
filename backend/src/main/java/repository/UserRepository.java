package com.example.demo.repository;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Check if a user already exists with this email
    boolean existsByEmail(String email);

    // Find a user by email
    Optional<User> findByEmail(String email);

    // New method needed for admin functionality
    long countByRole(Role role);
}