package com.example.demo.service;

import com.example.demo.dto.ContactRequest;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;

import java.util.*;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:ecommtest07@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:StopShop Ecommerce}")
    private String senderName;

    private final RestTemplate restTemplate;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void debugEmailConfig() {
        logger.info("Email service initialized with Brevo API");
        logger.info("Sender Email: {}", senderEmail);
        logger.info("Sender Name: {}", senderName);
        logger.info("Brevo API Key configured: {}", brevoApiKey != null && !brevoApiKey.isEmpty());

        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            logger.error("Brevo API key not configured! Check your environment variables.");
        }
    }

    private boolean sendEmail(String to, String subject, String htmlContent) {
        try {
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            Map<String, Object> emailData = new HashMap<>();

            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("email", senderEmail);
            sender.put("name", senderName);
            emailData.put("sender", sender);

            // Recipients
            List<Map<String, String>> recipients = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);
            recipients.add(recipient);
            emailData.put("to", recipients);

            // Content
            emailData.put("subject", subject);
            emailData.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(emailData, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Email sent successfully to: {}", to);
                return true;
            } else {
                logger.error("Failed to send email to {}: {}", to, response.getBody());
                return false;
            }

        } catch (Exception e) {
            logger.error("Error sending email to {}: {}", to, e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean sendOtpEmail(String toEmail, String otp, String userName) {
        try {
            logger.info("Attempting to send OTP email to: {}", toEmail);

            String subject = "Password Reset OTP - Your Ecommerce Store";
            String htmlContent = buildOtpEmailHtml(userName, otp);

            boolean result = sendEmail(toEmail, subject, htmlContent);
            if (result) {
                logger.info("OTP email sent successfully to: {}", toEmail);
            }
            return result;

        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            logger.error("Full error: ", e);
            return false;
        }
    }

    private String buildOtpEmailHtml(String userName, String otp) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #007bff;">Password Reset Request</h2>
                    <p>Hello %s,</p>
                    <p>Your password reset OTP is:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #007bff; font-size: 36px; margin: 0;">%s</h1>
                    </div>
                    <p><strong>This OTP expires in 10 minutes.</strong> Do not share it with anyone.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Best regards,<br>Your Ecommerce Store Team</p>
                </div>
            </body>
            </html>
            """, userName != null ? userName : "User", otp);
    }

    public boolean sendPasswordResetConfirmation(String toEmail, String userName) {
        try {
            logger.info("Sending password reset confirmation to: {}", toEmail);

            String subject = "Password Reset Successful - Your Ecommerce Store";
            String htmlContent = buildPasswordResetConfirmationHtml(userName);

            boolean result = sendEmail(toEmail, subject, htmlContent);
            if (result) {
                logger.info("Password reset confirmation sent to: {}", toEmail);
            }
            return result;

        } catch (Exception e) {
            logger.error("Failed to send confirmation email to {}: {}", toEmail, e.getMessage());
            logger.error("Full error: ", e);
            return false;
        }
    }

    private String buildPasswordResetConfirmationHtml(String userName) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #28a745;">Password Reset Successful</h2>
                    <p>Hello %s,</p>
                    <p>Your password has been successfully reset.</p>
                    <p><strong>If you didn't make this change, contact our support team immediately.</strong></p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Best regards,<br>Your Ecommerce Store Team</p>
                </div>
            </body>
            </html>
            """, userName != null ? userName : "User");
    }

    public boolean sendOrderConfirmationEmail(String toEmail, String userName, Order order) {
        try {
            logger.info("Sending order confirmation to: {} for order: {}", toEmail, order.getId());

            String subject = "Order Confirmed #" + order.getId() + " - Your Ecommerce Store";
            String htmlContent = buildOrderConfirmationEmailHtml(userName, order);

            boolean result = sendEmail(toEmail, subject, htmlContent);
            if (result) {
                logger.info("Order confirmation email sent successfully to: {} for order: {}", toEmail, order.getId());
            }
            return result;

        } catch (Exception e) {
            logger.error("Failed to send order confirmation email to {} for order {}: {}", toEmail, order.getId(), e.getMessage());
            logger.error("Full error: ", e);
            return false;
        }
    }

    private String buildOrderConfirmationEmailHtml(String userName, Order order) {
        StringBuilder itemsHtml = new StringBuilder();

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                itemsHtml.append(String.format("""
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">%s (%s)</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">%d</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹%.2f</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹%.2f</td>
                    </tr>
                    """,
                        item.getProductName(),
                        item.getColor(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getItemTotal()));
            }
        }

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #28a745;">Order Confirmed!</h2>
                    <p>Hello %s,</p>
                    <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order ID:</strong> #%d</p>
                        <p><strong>Order Date:</strong> %s</p>
                        <p><strong>Status:</strong> %s</p>
                    </div>
                    
                    <h3>Items Ordered</h3>
                    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #007bff; color: white;">
                                <th style="padding: 12px; text-align: left;">Item</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right;">Price</th>
                                <th style="padding: 12px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            %s
                        </tbody>
                    </table>
                    
                    <div style="text-align: right; margin: 20px 0;">
                        <p><strong>Subtotal: ₹%.2f</strong></p>
                        <p><strong>Shipping: ₹%.2f</strong></p>
                        <p style="font-size: 18px; color: #007bff;"><strong>TOTAL: ₹%.2f</strong></p>
                    </div>
                    
                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="margin-top: 0;">What's Next?</h4>
                        <ul>
                            <li>We'll email you when your order ships</li>
                            <li>Track your order in your account</li>
                            <li>Contact support for any questions</li>
                        </ul>
                    </div>
                    
                    <p>Thank you for shopping with us!</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Best regards,<br>Your Ecommerce Store Team</p>
                </div>
            </body>
            </html>
            """,
                userName != null ? userName : "Valued Customer",
                order.getId(),
                formatDate(order.getCreatedAt().toString()),
                capitalizeStatus(order.getStatus()),
                itemsHtml.toString(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getOrderTotal());
    }

    public boolean sendOrderStatusUpdateEmail(String toEmail, String userName, Order order, String previousStatus, String newStatus) {
        try {
            logger.info("Sending order status update to: {} for order: {} (status: {} -> {})", toEmail, order.getId(), previousStatus, newStatus);

            String subject = "Order Update #" + order.getId() + " - " + capitalizeStatus(newStatus) + " - Your Ecommerce Store";
            String htmlContent = buildOrderStatusUpdateEmailHtml(userName, order, previousStatus, newStatus);

            boolean result = sendEmail(toEmail, subject, htmlContent);
            if (result) {
                logger.info("Order status update email sent successfully to: {} for order: {} (status: {} -> {})", toEmail, order.getId(), previousStatus, newStatus);
            }
            return result;

        } catch (Exception e) {
            logger.error("Failed to send order status update email to {} for order {} (status: {} -> {}): {}", toEmail, order.getId(), previousStatus, newStatus, e.getMessage());
            logger.error("Full error: ", e);
            return false;
        }
    }

    private String buildOrderStatusUpdateEmailHtml(String userName, Order order, String previousStatus, String newStatus) {
        String statusColor = getStatusColor(newStatus);
        String statusMessage = getStatusMessage(newStatus);
        String nextSteps = getNextStepsMessage(newStatus);

        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                itemsHtml.append(String.format("""
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">%s</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">%d</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹%.2f</td>
                    </tr>
                    """, item.getProductName(), item.getQuantity(), item.getItemTotal()));
            }
        }

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: %s;">Order Status Update</h2>
                    <p>Hello %s,</p>
                    <p>%s</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Summary</h3>
                        <p><strong>Order ID:</strong> #%d</p>
                        <p><strong>Order Date:</strong> %s</p>
                        <p><strong>Previous Status:</strong> %s</p>
                        <p><strong>Current Status:</strong> <span style="color: %s; font-weight: bold;">%s</span></p>
                    </div>
                    
                    %s
                    
                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p>%s</p>
                    </div>
                    
                    <p>Track your order in your account or contact support for assistance.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Best regards,<br>Your Ecommerce Store Team</p>
                </div>
            </body>
            </html>
            """,
                statusColor,
                userName != null ? userName : "Valued Customer",
                statusMessage,
                order.getId(),
                formatDate(order.getCreatedAt().toString()),
                capitalizeStatus(previousStatus),
                statusColor,
                capitalizeStatus(newStatus),
                order.getItems() != null && !order.getItems().isEmpty() ?
                        String.format("""
                    <h3>Items</h3>
                    <table style="width: 100%%; border-collapse: collapse; margin: 10px 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 8px; text-align: left;">Item</th>
                                <th style="padding: 8px; text-align: center;">Qty</th>
                                <th style="padding: 8px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>%s</tbody>
                    </table>
                    <p style="text-align: right;"><strong>Total Amount: ₹%.2f</strong></p>
                    """, itemsHtml.toString(), order.getOrderTotal()) : "",
                nextSteps);
    }

    private String getStatusColor(String status) {
        switch (status.toLowerCase()) {
            case "processing":
                return "#ffc107";
            case "shipped":
                return "#007bff";
            case "delivered":
                return "#28a745";
            case "cancelled":
                return "#dc3545";
            default:
                return "#6c757d";
        }
    }

    private String getStatusMessage(String status) {
        switch (status.toLowerCase()) {
            case "processing":
                return "Your order is now being prepared for shipment.";
            case "shipped":
                return "Great news! Your order has been shipped.";
            case "delivered":
                return "Your order has been delivered successfully!";
            case "cancelled":
                return "Your order has been cancelled. Contact support if you have questions.";
            default:
                return String.format("Your order status has been updated to %s.", capitalizeStatus(status));
        }
    }

    private String getNextStepsMessage(String status) {
        switch (status.toLowerCase()) {
            case "processing":
                return "Your order is being carefully prepared and will ship soon.";
            case "shipped":
                return "Your package is on its way and should arrive in 3-5 business days.";
            case "delivered":
                return "We hope you love your purchase! Contact us if you need any assistance.";
            case "cancelled":
                return "If payment was processed, your refund will be issued within 3-5 business days.";
            default:
                return "We'll keep you updated as your order progresses.";
        }
    }

    public boolean sendContactFormEmail(ContactRequest contactRequest) {
        try {
            logger.info("Sending contact form email from: {} ({})", contactRequest.getUsername(), contactRequest.getEmail());

            String subject = "Contact Form: " + contactRequest.getUsername();
            String htmlContent = buildContactFormEmailHtml(contactRequest);

            boolean result = sendEmail(senderEmail, subject, htmlContent); // Send to your own email
            if (result) {
                logger.info("Contact form email sent successfully from: {} ({})", contactRequest.getUsername(), contactRequest.getEmail());
            }
            return result;

        } catch (Exception e) {
            logger.error("Failed to send contact form email from {} ({}): {}", contactRequest.getUsername(), contactRequest.getEmail(), e.getMessage());
            logger.error("Full error: ", e);
            return false;
        }
    }

    private String buildContactFormEmailHtml(ContactRequest contactRequest) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #007bff;">New Contact Form Message</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>From:</strong> %s</p>
                        <p><strong>Email:</strong> %s</p>
                        <p><strong>Date:</strong> %s</p>
                    </div>
                    
                    <h3>Message:</h3>
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                        <p>%s</p>
                    </div>
                    
                    <p style="color: #666; font-size: 12px;">Reply directly to <a href="mailto:%s">%s</a> to respond to the customer.</p>
                </div>
            </body>
            </html>
            """,
                contactRequest.getUsername(),
                contactRequest.getEmail(),
                java.time.LocalDateTime.now().toString().split("T")[0],
                contactRequest.getMessage().replace("\n", "<br>"),
                contactRequest.getEmail(),
                contactRequest.getEmail());
    }

    private String capitalizeStatus(String status) {
        if (status == null || status.isEmpty()) {
            return status;
        }
        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
    }

    private String formatDate(String dateString) {
        try {
            return dateString.split("T")[0];
        } catch (Exception e) {
            return dateString;
        }
    }
}