// src/main/java/com/example/demo/service/EmailService.java
package com.example.demo.service;

import com.example.demo.dto.ContactRequest;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public boolean sendOtpEmail(String toEmail, String otp, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Password Reset OTP - Your Ecommerce Store");
            message.setText(buildOtpEmailBody(userName, otp));
            message.setFrom("ecommtest07@gmail.com");

            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", toEmail);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private String buildOtpEmailBody(String userName, String otp) {
        return String.format("""
            Hello %s,
            
            Your password reset OTP is: %s
            
            This OTP expires in 10 minutes. Do not share it with anyone.
            
            If you didn't request this, please ignore this email.
            
            Best regards,
            Your Ecommerce Store Team
            """, userName != null ? userName : "User", otp);
    }

    public boolean sendPasswordResetConfirmation(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Password Reset Successful - Your Ecommerce Store");
            message.setText(buildPasswordResetConfirmationBody(userName));
            message.setFrom("ecommtest07@gmail.com");

            mailSender.send(message);
            logger.info("Password reset confirmation sent to: {}", toEmail);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send confirmation email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private String buildPasswordResetConfirmationBody(String userName) {
        return String.format("""
            Hello %s,
            
            Your password has been successfully reset.
            
            If you didn't make this change, contact our support team immediately.
            
            Best regards,
            Your Ecommerce Store Team
            """, userName != null ? userName : "User");
    }

    public boolean sendOrderConfirmationEmail(String toEmail, String userName, Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Order Confirmed #" + order.getId() + " - Your Ecommerce Store");
            message.setText(buildOrderConfirmationEmailBody(userName, order));
            message.setFrom("ecommtest07@gmail.com");

            mailSender.send(message);
            logger.info("Order confirmation email sent successfully to: {} for order: {}", toEmail, order.getId());
            return true;

        } catch (Exception e) {
            logger.error("Failed to send order confirmation email to {} for order {}: {}", toEmail, order.getId(), e.getMessage());
            return false;
        }
    }

    private String buildOrderConfirmationEmailBody(String userName, Order order) {
        StringBuilder emailBody = new StringBuilder();

        emailBody.append(String.format("Hello %s,\n\n", userName != null ? userName : "Valued Customer"));
        emailBody.append("Thank you for your order! Your order has been confirmed and is being processed.\n\n");

        // Order Details
        emailBody.append("ORDER DETAILS\n");
        emailBody.append("=============\n");
        emailBody.append(String.format("Order ID: #%d\n", order.getId()));
        emailBody.append(String.format("Order Date: %s\n", formatDate(order.getCreatedAt().toString())));
        emailBody.append(String.format("Status: %s\n\n", capitalizeStatus(order.getStatus())));

        // Items
        emailBody.append("ITEMS\n");
        emailBody.append("=====\n");
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                emailBody.append(String.format("%s (%s) - Qty: %d x ₹%.2f = ₹%.2f\n",
                        item.getProductName(),
                        item.getColor(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getItemTotal()));
            }
        }

        // Order Total
        emailBody.append(String.format("\nSubtotal: ₹%.2f\n", order.getSubtotal()));
        emailBody.append(String.format("Shipping: ₹%.2f\n", order.getShippingFee()));
        emailBody.append(String.format("TOTAL: ₹%.2f\n\n", order.getOrderTotal()));

        // Next Steps
        emailBody.append("WHAT'S NEXT?\n");
        emailBody.append("============\n");
        emailBody.append("• We'll email you when your order ships\n");
        emailBody.append("• Track your order in your account\n");
        emailBody.append("• Contact support for any questions\n\n");

        emailBody.append("Thank you for shopping with us!\n\n");
        emailBody.append("Best regards,\nYour Ecommerce Store Team");

        return emailBody.toString();
    }

    public boolean sendOrderStatusUpdateEmail(String toEmail, String userName, Order order, String previousStatus, String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Order Update #" + order.getId() + " - " + capitalizeStatus(newStatus) + " - Your Ecommerce Store");
            message.setText(buildOrderStatusUpdateEmailBody(userName, order, previousStatus, newStatus));
            message.setFrom("ecommtest07@gmail.com");

            mailSender.send(message);
            logger.info("Order status update email sent successfully to: {} for order: {} (status: {} -> {})", toEmail, order.getId(), previousStatus, newStatus);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send order status update email to {} for order {} (status: {} -> {}): {}", toEmail, order.getId(), previousStatus, newStatus, e.getMessage());
            return false;
        }
    }

    private String buildOrderStatusUpdateEmailBody(String userName, Order order, String previousStatus, String newStatus) {
        StringBuilder emailBody = new StringBuilder();

        emailBody.append(String.format("Hello %s,\n\n", userName != null ? userName : "Valued Customer"));

        // Status-specific opening message
        switch (newStatus.toLowerCase()) {
            case "processing":
                emailBody.append("Your order is now being prepared for shipment.\n\n");
                break;
            case "shipped":
                emailBody.append("Great news! Your order has been shipped.\n\n");
                break;
            case "delivered":
                emailBody.append("Your order has been delivered successfully!\n\n");
                break;
            case "cancelled":
                emailBody.append("Your order has been cancelled. Contact support if you have questions.\n\n");
                break;
            default:
                emailBody.append(String.format("Your order status has been updated to %s.\n\n", capitalizeStatus(newStatus)));
        }

        // Order Summary
        emailBody.append("ORDER SUMMARY\n");
        emailBody.append("=============\n");
        emailBody.append(String.format("Order ID: #%d\n", order.getId()));
        emailBody.append(String.format("Order Date: %s\n", formatDate(order.getCreatedAt().toString())));
        emailBody.append(String.format("Previous Status: %s\n", capitalizeStatus(previousStatus)));
        emailBody.append(String.format("Current Status: %s\n\n", capitalizeStatus(newStatus)));

        // Items Summary
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            emailBody.append("ITEMS\n");
            emailBody.append("=====\n");
            for (OrderItem item : order.getItems()) {
                emailBody.append(String.format("%s (Qty: %d) - ₹%.2f\n",
                        item.getProductName(),
                        item.getQuantity(),
                        item.getItemTotal()));
            }
            emailBody.append(String.format("\nTotal Amount: ₹%.2f\n\n", order.getOrderTotal()));
        }

        // Status-specific next steps
        switch (newStatus.toLowerCase()) {
            case "processing":
                emailBody.append("Your order is being carefully prepared and will ship soon.\n");
                break;
            case "shipped":
                emailBody.append("Your package is on its way and should arrive in 3-5 business days.\n");
                break;
            case "delivered":
                emailBody.append("We hope you love your purchase! Contact us if you need any assistance.\n");
                break;
            case "cancelled":
                emailBody.append("If payment was processed, your refund will be issued within 3-5 business days.\n");
                break;
        }

        emailBody.append("\nTrack your order in your account or contact support for assistance.\n\n");
        emailBody.append("Best regards,\nYour Ecommerce Store Team");

        return emailBody.toString();
    }

    private String capitalizeStatus(String status) {
        if (status == null || status.isEmpty()) {
            return status;
        }
        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
    }

    private String formatDate(String dateString) {
        // Simple date formatting - you can enhance this as needed
        try {
            return dateString.split("T")[0]; // Extract just the date part
        } catch (Exception e) {
            return dateString;
        }
    }

    public boolean sendContactFormEmail(ContactRequest contactRequest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("ecommtest07@gmail.com");
            message.setSubject("Contact Form: " + contactRequest.getUsername());
            message.setText(buildContactFormEmailBody(contactRequest));
            message.setFrom("ecommtest07@gmail.com");
            message.setReplyTo(contactRequest.getEmail());

            mailSender.send(message);
            logger.info("Contact form email sent successfully from: {} ({})", contactRequest.getUsername(), contactRequest.getEmail());
            return true;

        } catch (Exception e) {
            logger.error("Failed to send contact form email from {} ({}): {}", contactRequest.getUsername(), contactRequest.getEmail(), e.getMessage());
            return false;
        }
    }

    private String buildContactFormEmailBody(ContactRequest contactRequest) {
        StringBuilder emailBody = new StringBuilder();

        emailBody.append("NEW CONTACT FORM MESSAGE\n");
        emailBody.append("========================\n\n");

        emailBody.append(String.format("From: %s\n", contactRequest.getUsername()));
        emailBody.append(String.format("Email: %s\n", contactRequest.getEmail()));
        emailBody.append(String.format("Date: %s\n\n", java.time.LocalDateTime.now().toString().split("T")[0]));

        emailBody.append("MESSAGE:\n");
        emailBody.append("========\n");
        emailBody.append(contactRequest.getMessage());
        emailBody.append("\n\n");

        emailBody.append("Reply directly to this email to respond to the customer.");

        return emailBody.toString();
    }
}