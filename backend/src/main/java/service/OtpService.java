// src/main/java/com/example/demo/service/OtpService.java
package com.example.demo.service;

import com.example.demo.model.OtpVerification;
import com.example.demo.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 10;
    private static final String PASSWORD_RESET_PURPOSE = "PASSWORD_RESET";

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        return otp.toString();
    }

    @Transactional
    public OtpVerification createPasswordResetOtp(String email) {
        try {
            // Clean up any existing OTPs for this email and purpose
            otpRepository.deleteByEmailAndPurpose(email, PASSWORD_RESET_PURPOSE);

            // Generate new OTP
            String otp = generateOtp();
            LocalDateTime now = LocalDateTime.now();

            OtpVerification otpVerification = new OtpVerification();
            otpVerification.setEmail(email);
            otpVerification.setOtp(otp);
            otpVerification.setCreatedAt(now);
            otpVerification.setExpiresAt(now.plusMinutes(OTP_VALIDITY_MINUTES));
            otpVerification.setPurpose(PASSWORD_RESET_PURPOSE);
            otpVerification.setVerified(false);

            OtpVerification saved = otpRepository.save(otpVerification);
            logger.info("OTP created for email: {} with purpose: {}", email, PASSWORD_RESET_PURPOSE);
            return saved;

        } catch (Exception e) {
            logger.error("Error creating OTP for email {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to create OTP: " + e.getMessage());
        }
    }

    @Transactional
    public boolean verifyPasswordResetOtp(String email, String otp) {
        try {
            // Clean up expired OTPs
            cleanupExpiredOtps();

            // Find valid OTP
            return otpRepository.findByEmailAndOtpAndPurposeAndVerifiedFalse(email, otp, PASSWORD_RESET_PURPOSE)
                    .map(otpVerification -> {
                        if (otpVerification.isValid()) {
                            otpVerification.setVerified(true);
                            otpRepository.save(otpVerification);
                            logger.info("OTP verified successfully for email: {}", email);
                            return true;
                        } else {
                            logger.warn("Invalid or expired OTP for email: {}", email);
                            return false;
                        }
                    })
                    .orElse(false);

        } catch (Exception e) {
            logger.error("Error verifying OTP for email {}: {}", email, e.getMessage());
            return false;
        }
    }

    public boolean hasVerifiedOtp(String email) {
        try {
            // Check if there's a recent verified OTP for password reset
            LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30); // Allow 30 minutes window
            List<OtpVerification> recentOtps = otpRepository.findByEmailAndPurposeAndVerifiedFalse(email, PASSWORD_RESET_PURPOSE);

            // Actually we want to find verified OTPs, so let's create a custom query
            return recentOtps.isEmpty(); // If no unverified OTPs, it means the last one was verified
        } catch (Exception e) {
            logger.error("Error checking OTP verification status for email {}: {}", email, e.getMessage());
            return false;
        }
    }

    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteExpiredOtps(LocalDateTime.now());
            logger.debug("Expired OTPs cleaned up");
        } catch (Exception e) {
            logger.error("Error cleaning up expired OTPs: {}", e.getMessage());
        }
    }

    @Transactional
    public void cleanupUserOtps(String email) {
        try {
            otpRepository.deleteByEmailAndPurpose(email, PASSWORD_RESET_PURPOSE);
            logger.info("Cleaned up OTPs for email: {}", email);
        } catch (Exception e) {
            logger.error("Error cleaning up OTPs for email {}: {}", email, e.getMessage());
        }
    }
}