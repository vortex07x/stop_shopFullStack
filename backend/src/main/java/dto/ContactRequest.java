package com.example.demo.dto;

public class ContactRequest {
    private String username;
    private String email;
    private String message;

    // Default constructor
    public ContactRequest() {}

    // Parameterized constructor
    public ContactRequest(String username, String email, String message) {
        this.username = username;
        this.email = email;
        this.message = message;
    }

    // Validation method
    public boolean isValid() {
        // Check if basic fields are not null and valid
        if (username == null || username.trim().isEmpty()) {
            return false;
        }

        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        // Basic email validation
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return false;
        }

        if (message == null || message.trim().isEmpty()) {
            return false;
        }

        // Check minimum message length
        if (message.trim().length() < 10) {
            return false;
        }

        return true;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "ContactRequest{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", messageLength=" + (message != null ? message.length() : 0) +
                '}';
    }
}