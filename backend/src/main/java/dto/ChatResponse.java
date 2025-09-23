package com.example.demo.dto;

import java.util.List;

public class ChatResponse {
    private String message;
    private String type; // "text", "product_list", "order_info", "greeting", "help", "error"
    private List<Object> data; // additional data like product list or order info

    // Default constructor
    public ChatResponse() {}

    // Constructor with message and type
    public ChatResponse(String message, String type) {
        this.message = message;
        this.type = type;
    }

    // Constructor with all fields
    public ChatResponse(String message, String type, List<Object> data) {
        this.message = message;
        this.type = type;
        this.data = data;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Object> getData() {
        return data;
    }

    public void setData(List<Object> data) {
        this.data = data;
    }
}