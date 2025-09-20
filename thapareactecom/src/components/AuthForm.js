import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import ForgotPasswordModal from "./ForgotPasswordModal"; // ✅ New import

const AuthForm = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // toggle between login/register
  const [animating, setAnimating] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // ✅ New state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(""); // success message state

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on typing
    setSuccessMsg(""); // clear success if editing again
  };

  // Custom validation
  const validate = () => {
    let newErrors = {};
    if (!isLogin && !formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  // ✅ Enhanced function to dispatch login events
  const dispatchLoginEvents = () => {
    console.log("🚀 Dispatching login events to update navbar and cart");
    
    // Dispatch multiple events to ensure all components are notified
    window.dispatchEvent(new Event("storage")); // For navbar profile update
    window.dispatchEvent(new CustomEvent('userLoggedIn')); // For cart context
    window.dispatchEvent(new CustomEvent('profileUpdated')); // For profile updates
    
    // Also dispatch a storage event with token key for cross-tab compatibility
    window.dispatchEvent(new StorageEvent("storage", {
      key: "token",
      newValue: localStorage.getItem("token"),
      url: window.location.href
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isLogin) {
        // Login API call
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Logged in:", data);

          // Save JWT token and user data to localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("userEmail", data.email);
          localStorage.setItem("userRole", data.role);
          
          // Store username from backend response
          if (data.name) {
            localStorage.setItem("userName", data.name);
            console.log("✅ Stored username from backend:", data.name);
          } else {
            console.log("⚠️ No username in API response - check backend LoginResponse");
          }

          // ✅ Store avatar from backend response
          if (data.avatar) {
            localStorage.setItem("userAvatar", data.avatar);
            console.log("✅ Stored avatar from backend:", data.avatar);
          } else {
            console.log("⚠️ No avatar in API response - will be generated on profile page");
          }

          // ✅ Enhanced: Dispatch multiple login events
          dispatchLoginEvents();

          setSuccessMsg("Login successful!");
          setTimeout(() => onClose(), 1200); // close after short delay
        } else {
          setSuccessMsg("");
          setErrors({ email: "Invalid email or password" });
        }
      } else {
        // Register API call
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Registered successfully:", data);

          // Store user data after successful registration
          if (data.token) {
            // If backend returns token immediately after registration
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", data.email || formData.email);
            localStorage.setItem("userName", data.name || formData.username);
            localStorage.setItem("userRole", data.role || "user");
            
            // ✅ Store avatar from registration response
            if (data.avatar) {
              localStorage.setItem("userAvatar", data.avatar);
              console.log("✅ Stored avatar from registration:", data.avatar);
            }
            
            // ✅ Enhanced: Dispatch multiple login events
            dispatchLoginEvents();
            
            setSuccessMsg("Registration successful! Welcome! 🎉");
            setTimeout(() => onClose(), 1200);
          } else {
            // If backend requires separate login after registration
            setSuccessMsg("Registration successful! 🎉 Please log in.");
            setFormData({ username: "", email: "", password: "" });
            setIsLogin(true); // switch to login after register
          }
        } else {
          setSuccessMsg("");
          if (response.status === 409) {
            setErrors({ email: "Email already exists. Please use another." });
          } else {
            const errorText = await response.text();
            console.error("❌ Registration failed:", errorText);
            setErrors({ email: "Registration failed. Please try again." });
          }
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setSuccessMsg("");
      setErrors({ email: "Something went wrong. Please try again." });
    }
  };

  // Toggle with animation
  const toggleForm = () => {
    setAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setErrors({});
      setSuccessMsg("");
      setFormData({ username: "", email: "", password: "" });
      setAnimating(false);
    }, 300);
  };

  // ✅ New function: Handle forgot password
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  // ✅ New function: Close forgot password modal
  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
  };

  return (
    <>
      <Overlay>
        <Modal>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
          <div className={`form-wrapper ${animating ? "fade-out" : "fade-in"}`}>
            <h2>{isLogin ? "Log In" : "Register"}</h2>
            <form onSubmit={handleSubmit} noValidate>
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="off"
                    autoCapitalize="none"
                  />
                  {errors.username && (
                    <span className="error">{errors.username}</span>
                  )}
                </div>
              )}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  autoCapitalize="none"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  autoCapitalize="none"
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>
              
              {/* ✅ Forgot Password Link - only show on login */}
              {isLogin && (
                <ForgotPasswordLink onClick={handleForgotPassword}>
                  Forgot Password?
                </ForgotPasswordLink>
              )}
              
              <button type="submit">{isLogin ? "Log In" : "Register"}</button>

              {/* Success message inline */}
              {successMsg && <p className="success-msg">{successMsg}</p>}
            </form>
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span onClick={toggleForm}>
                {isLogin ? "Register here" : "Log in here"}
              </span>
            </p>
          </div>
        </Modal>
      </Overlay>
      
      {/* ✅ Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={closeForgotPasswordModal} />
      )}
    </>
  );
};

export default AuthForm;

// Animations (unchanged)
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideUp = keyframes`
  from { transform: translateY(60px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// ✅ Forgot Password Link Style
const ForgotPasswordLink = styled.span`
  color: #007bff;
  cursor: pointer;
  font-size: 1.3rem;
  text-decoration: underline;
  text-align: right;
  display: block;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
  }
`;

// styled-components (unchanged)
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const Modal = styled.div`
  background: #fff;
  padding: 3rem 2.5rem;
  border-radius: 1.2rem;
  width: 95%;
  max-width: 520px;
  text-align: center;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.4s ease forwards;

  .form-wrapper {
    &.fade-in {
      animation: ${fadeIn} 0.3s ease forwards;
    }
    &.fade-out {
      animation: ${fadeOut} 0.3s ease forwards;
    }
  }

  h2 {
    margin-bottom: 2rem;
    font-size: 2.6rem;
    font-weight: 700;
    color: #222;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    input {
      padding: 1.1rem 1.2rem;
      border: 1px solid #ddd;
      border-radius: 0.7rem;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      text-transform: none;

      &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
        outline: none;
      }
    }

    .error {
      display: block;
      margin-top: 0.3rem;
      font-size: 1.2rem;
      color: #d9534f;
      text-align: left;
    }

    .success-msg {
      margin-top: 1rem;
      font-size: 1.3rem;
      color: #28a745; /* green for success */
      font-weight: 600;
      text-align: center;
      animation: ${fadeIn} 0.3s ease forwards;
    }

    button {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 0.7rem;
      cursor: pointer;
      font-size: 1.5rem;
      font-weight: 600;
      transition: transform 0.2s ease, background 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #0056b3, #003f7f);
      }
    }
  }

  p {
    margin-top: 1.6rem;
    font-size: 1.4rem;
    color: #555;

    span {
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.3s ease;

      &:hover {
        color: #0056b3;
      }
    }
  }

  .close-btn {
    position: absolute;
    top: 1.2rem;
    right: 1.2rem;
    background: transparent;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #666;
    transition: color 0.2s ease;

    &:hover {
      color: #000;
    }
  }
`;