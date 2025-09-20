package com.example.demo.controller;

import com.example.demo.dto.ContactRequest;
import com.example.demo.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ContactController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendContactMessage(@RequestBody ContactRequest contactRequest) {
        Map<String, String> response = new HashMap<>();

        try {
            // Validate request
            if (contactRequest == null) {
                response.put("status", "error");
                response.put("message", "Contact request cannot be empty");
                return ResponseEntity.badRequest().body(response);
            }

            if (!contactRequest.isValid()) {
                response.put("status", "error");
                response.put("message", "Please fill all fields correctly. Message should be at least 10 characters long.");
                return ResponseEntity.badRequest().body(response);
            }

            // Sanitize input - convert email to lowercase and trim spaces
            contactRequest.setEmail(contactRequest.getEmail().toLowerCase().trim());
            contactRequest.setUsername(contactRequest.getUsername().trim());
            contactRequest.setMessage(contactRequest.getMessage().trim());

            System.out.println("Received contact form submission from: " + contactRequest.getEmail());
            System.out.println("Contact request details: " + contactRequest.toString());

            // Send email to admin
            boolean emailSent = emailService.sendContactFormEmail(contactRequest);

            if (emailSent) {
                System.out.println("Contact form email sent successfully to admin");
                response.put("status", "success");
                response.put("message", "Your message has been sent successfully! We'll get back to you soon.");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("Failed to send contact form email");
                response.put("status", "error");
                response.put("message", "Failed to send your message. Please try again later.");
                return ResponseEntity.status(500).body(response);
            }

        } catch (Exception e) {
            System.err.println("Error processing contact form: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Something went wrong. Please try again later.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // Add a test endpoint to check if the controller is working
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Contact controller is working!");
        return ResponseEntity.ok(response);
    }
}