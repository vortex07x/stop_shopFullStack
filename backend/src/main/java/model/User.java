//user
//user
package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user") // Changed from "users" to "user"
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore // Don't serialize password
    private String password;

    @Column(nullable = false, name = "name") // Map to existing "name" column
    private String name;

    // Add avatar field to store avatar URL/identifier
    @Column(name = "avatar", length = 500) // Make it long enough for URLs
    private String avatar;

    // Add role field that was missing
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    // Don't serialize orders and cart items to prevent circular references
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Order> orders;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CartItem> cartItems;

    // Add getRole method that was missing
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // Avatar getter and setter
    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    // Helper methods for backward compatibility
    public String getFirstName() {
        if (name != null && name.contains(" ")) {
            return name.split(" ")[0];
        }
        return name;
    }

    public String getLastName() {
        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ");
            if (parts.length > 1) {
                return name.substring(name.indexOf(" ") + 1);
            }
        }
        return "";
    }

    public String getFullName() {
        return name != null ? name : "";
    }

    // Setter for firstName/lastName compatibility
    public void setFirstName(String firstName) {
        if (this.name == null || this.name.isEmpty()) {
            this.name = firstName;
        } else {
            // Update the first part of the name
            String lastName = getLastName();
            this.name = firstName + (lastName.isEmpty() ? "" : " " + lastName);
        }
    }

    public void setLastName(String lastName) {
        String firstName = getFirstName();
        this.name = firstName + (lastName.isEmpty() ? "" : " " + lastName);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", role=" + role +
                ", avatar='" + avatar + '\'' +
                '}';
    }
}