package com.example.demo.dto;

public class ChatRequest {
    private String message;
    private Long userId; // optional, for logged-in users

    // Default constructor
    public ChatRequest() {}

    // Parameterized constructor
    public ChatRequest(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}