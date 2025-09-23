package com.example.demo.controller;

import com.example.demo.dto.ChatRequest;
import com.example.demo.dto.ChatResponse;
import com.example.demo.service.ChatBotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // Added multiple origins
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatBotService chatBotService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        try {
            logger.info("Received chat message: {} from user: {}",
                    request.getMessage(), request.getUserId());

            // Validate request
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                ChatResponse errorResponse = new ChatResponse(
                        "Please enter a message!",
                        "error"
                );
                return ResponseEntity.badRequest().body(errorResponse);
            }

            ChatResponse response = chatBotService.processMessage(
                    request.getMessage().trim(),
                    request.getUserId()
            );

            logger.info("Sending chat response: {} of type: {}",
                    response.getMessage(), response.getType());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing chat message: ", e);
            ChatResponse errorResponse = new ChatResponse(
                    "Sorry, I'm having trouble right now. Please try again later!",
                    "error"
            );
            return ResponseEntity.ok(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        logger.info("Health check endpoint called");
        return ResponseEntity.ok("Chatbot is running successfully!");
    }

    @GetMapping("/status")
    public ResponseEntity<ChatResponse> getStatus() {
        ChatResponse statusResponse = new ChatResponse(
                "Chatbot is online and ready to help! Ask me about products, orders, or anything else!",
                "status"
        );
        return ResponseEntity.ok(statusResponse);
    }
}