package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "StopShop Backend API is running!");
        response.put("status", "success");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("database", "connected");
        response.put("service", "operational");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/test")
    public ResponseEntity<Map<String, Object>> publicTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Public endpoint working");
        response.put("authenticated", false);
        response.put("timestamp", LocalDateTime.now().toString());

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("auth", "/api/auth/**");
        endpoints.put("products", "/api/products/**");
        endpoints.put("contact", "/api/contact/**");
        endpoints.put("chat", "/api/chat/**");
        response.put("publicEndpoints", endpoints);

        return ResponseEntity.ok(response);
    }
}