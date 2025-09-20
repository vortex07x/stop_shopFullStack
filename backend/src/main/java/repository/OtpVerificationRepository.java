// src/main/java/com/example/demo/repository/OtpVerificationRepository.java
package com.example.demo.repository;

import com.example.demo.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByEmailAndOtpAndPurposeAndVerifiedFalse(
            String email, String otp, String purpose);

    List<OtpVerification> findByEmailAndPurposeAndVerifiedFalse(String email, String purpose);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpVerification o WHERE o.email = :email AND o.purpose = :purpose")
    void deleteByEmailAndPurpose(@Param("email") String email, @Param("purpose") String purpose);
}