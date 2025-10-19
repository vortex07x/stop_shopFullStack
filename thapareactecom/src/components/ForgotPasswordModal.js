import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

const ForgotPasswordModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Clear error when typing
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    setSuccessMsg("");
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Invalid email format" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("https://stopshop-backend.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("OTP sent to your email!");
        setTimeout(() => {
          setCurrentStep(2);
          setSuccessMsg("");
        }, 1500);
      } else {
        setErrors({ email: data.message || "Failed to send OTP. Please try again." });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("https://stopshop-backend.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("OTP verified successfully!");
        setTimeout(() => {
          setCurrentStep(3);
          setSuccessMsg("");
        }, 1500);
      } else {
        setErrors({ otp: data.message || "Invalid or expired OTP" });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setErrors({ otp: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword.trim()) {
      setErrors({ newPassword: "New password is required" });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }
    if (!confirmPassword.trim()) {
      setErrors({ confirmPassword: "Please confirm your password" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("https://stopshop-backend.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Password reset successfully! You can now log in.");
        setTimeout(() => {
          onClose(); // Close modal after success
        }, 2000);
      } else {
        setErrors({ newPassword: data.message || "Failed to reset password. Please try again." });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrors({ newPassword: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      setSuccessMsg("");
    }
  };

  return (
    <Overlay>
      <Modal>
        <CloseButton onClick={onClose}>✖</CloseButton>
        
        {/* Step Indicator */}
        <StepIndicator>
          <Step active={currentStep >= 1} completed={currentStep > 1}>1</Step>
          <StepLine completed={currentStep > 1} />
          <Step active={currentStep >= 2} completed={currentStep > 2}>2</Step>
          <StepLine completed={currentStep > 2} />
          <Step active={currentStep >= 3}>3</Step>
        </StepIndicator>

        <ModalContent>
          {/* Step 1: Enter Email */}
          {currentStep === 1 && (
            <div>
              <h2>Forgot Password</h2>
              <p>Enter your email address to receive an OTP</p>
              <form onSubmit={handleSendOtp}>
                <InputGroup>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      // Convert email to lowercase automatically
                      const lowerCaseEmail = e.target.value.toLowerCase();
                      setEmail(lowerCaseEmail);
                      clearError('email');
                    }}
                    onInput={(e) => {
                      // Additional safeguard - force lowercase on input event too
                      e.target.value = e.target.value.toLowerCase();
                    }}
                    style={{ textTransform: 'lowercase' }}
                    autoComplete="off"
                    disabled={loading}
                  />
                  {errors.email && <ErrorMsg>{errors.email}</ErrorMsg>}
                </InputGroup>
                
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
                
                {successMsg && <SuccessMsg>{successMsg}</SuccessMsg>}
              </form>
            </div>
          )}

          {/* Step 2: Enter OTP */}
          {currentStep === 2 && (
            <div>
              <h2>Enter OTP</h2>
              <p>We've sent a 6-digit code to <strong>{email}</strong></p>
              <form onSubmit={handleVerifyOtp}>
                <InputGroup>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      // Allow only numbers and limit to 6 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      clearError('otp');
                    }}
                    maxLength="6"
                    autoComplete="off"
                    disabled={loading}
                  />
                  {errors.otp && <ErrorMsg>{errors.otp}</ErrorMsg>}
                </InputGroup>
                
                <ButtonGroup>
                  <BackButton type="button" onClick={goBack} disabled={loading}>
                    Back
                  </BackButton>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </ButtonGroup>
                
                {successMsg && <SuccessMsg>{successMsg}</SuccessMsg>}
              </form>
            </div>
          )}

          {/* Step 3: Enter New Password */}
          {currentStep === 3 && (
            <div>
              <h2>Reset Password</h2>
              <p>Enter your new password</p>
              <form onSubmit={handleResetPassword}>
                <InputGroup>
                  <input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      clearError('newPassword');
                    }}
                    autoComplete="off"
                    disabled={loading}
                  />
                  {errors.newPassword && <ErrorMsg>{errors.newPassword}</ErrorMsg>}
                </InputGroup>
                
                <InputGroup>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError('confirmPassword');
                    }}
                    autoComplete="off"
                    disabled={loading}
                  />
                  {errors.confirmPassword && <ErrorMsg>{errors.confirmPassword}</ErrorMsg>}
                </InputGroup>
                
                <ButtonGroup>
                  <BackButton type="button" onClick={goBack} disabled={loading}>
                    Back
                  </BackButton>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </ButtonGroup>
                
                {successMsg && <SuccessMsg>{successMsg}</SuccessMsg>}
              </form>
            </div>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

export default ForgotPasswordModal;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(60px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100; /* Higher than AuthForm */
  animation: ${fadeIn} 0.3s ease forwards;
`;

const Modal = styled.div`
  background: #fff;
  padding: 2.5rem;
  border-radius: 1.2rem;
  width: 95%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.4s ease forwards;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  background: ${props => 
    props.completed ? '#28a745' : 
    props.active ? '#007bff' : '#e9ecef'
  };
  color: ${props => 
    props.completed || props.active ? '#fff' : '#6c757d'
  };
  transition: all 0.3s ease;
`;

const StepLine = styled.div`
  width: 40px;
  height: 2px;
  background: ${props => props.completed ? '#28a745' : '#e9ecef'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  text-align: center;

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    color: #222;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.3rem;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.4;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;

  input {
    width: 100%;
    padding: 1rem 1.2rem;
    border: 1px solid #ddd;
    border-radius: 0.7rem;
    font-size: 1.4rem;
    transition: all 0.3s ease;

    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
      outline: none;
    }

    &:disabled {
      background-color: #f8f9fa;
      cursor: not-allowed;
    }
  }
`;

const ErrorMsg = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-size: 1.2rem;
  color: #d9534f;
  text-align: left;
`;

const SuccessMsg = styled.p`
  margin-top: 1rem;
  font-size: 1.3rem;
  color: #28a745;
  font-weight: 600;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0.7rem;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #0056b3, #003f7f);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const BackButton = styled.button`
  flex: 1;
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 1rem;
  border-radius: 0.7rem;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #007bff;
    color: white;
  }

  &:disabled {
    border-color: #6c757d;
    color: #6c757d;
    cursor: not-allowed;
  }
`;