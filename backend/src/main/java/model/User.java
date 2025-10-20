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
@Table(name = "users") // Changed from "user" to "users" - "user" is reserved in PostgreSQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore // Don't serialize password
    private String password;

    @Column(nullable = false, name = "name")
    private String name;

    @Column(name = "avatar", length = 500)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Order> orders;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CartItem> cartItems;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

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

    public void setFirstName(String firstName) {
        if (this.name == null || this.name.isEmpty()) {
            this.name = firstName;
        } else {
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