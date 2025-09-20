import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import styled, { keyframes } from "styled-components";

const Contact = () => {
  const { isAuthenticated, user } = useAuth0();
  const [formData, setFormData] = useState({
    username: isAuthenticated ? user?.name || "" : "",
    email: isAuthenticated ? user?.email || "" : "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Convert email to lowercase automatically
    if (name === "email") {
      processedValue = value.toLowerCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear feedback when user starts typing
    if (feedback.message) {
      setFeedback({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFeedback({ type: "error", message: "Please fill in all fields" });
      return;
    }
    
    if (formData.message.trim().length < 10) {
      setFeedback({ type: "error", message: "Message should be at least 10 characters long" });
      return;
    }

    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      setFeedback({ type: "error", message: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      console.log("Sending contact form data:", formData);

      const response = await fetch("http://localhost:8080/api/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.toLowerCase().trim(),
          message: formData.message.trim()
        })
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is ok
      if (!response.ok) {
        console.error("Response not ok:", response.status, response.statusText);
        
        // Try to get error message from response
        let errorMessage = "Failed to send message. Please try again.";
        try {
          const errorData = await response.text(); // Use text() first to see what we're getting
          console.log("Error response body:", errorData);
          
          // Try to parse as JSON if it looks like JSON
          if (errorData.trim().startsWith('{')) {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.message || errorMessage;
          }
        } catch (parseError) {
          console.log("Could not parse error response as JSON:", parseError);
        }
        
        setFeedback({ type: "error", message: errorMessage });
        return;
      }

      // Try to parse the response
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        console.log("Response was:", responseText);
        setFeedback({ type: "error", message: "Server returned an invalid response. Please try again." });
        return;
      }

      console.log("Parsed response data:", data);

      if (data.status === "success") {
        setFeedback({ type: "success", message: data.message || "Your message has been sent successfully!" });
        // Clear form after successful submission
        setFormData({
          username: isAuthenticated ? user?.name || "" : "",
          email: isAuthenticated ? user?.email || "" : "",
          message: ""
        });
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to send message. Please try again." });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setFeedback({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  // Test function to check backend connectivity
  const testConnection = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/contact/test", {
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      });
      
      const data = await response.json();
      console.log("Test connection result:", data);
      setFeedback({ 
        type: response.ok ? "success" : "error", 
        message: response.ok ? "Backend connection successful!" : "Backend connection failed!" 
      });
    } catch (error) {
      console.error("Test connection error:", error);
      setFeedback({ type: "error", message: "Cannot connect to backend server!" });
    }
  };

  return (
    <Wrapper>
      <HeaderSection>
        <h1 className="main-heading">Get In Touch</h1>
        <p className="heading-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </HeaderSection>

      <MapSection>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117057.26374724657!2d87.21777250612621!3d23.531081960239405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f7710b47a89171%3A0x429e1bdb57e009dd!2sDurgapur%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1713935550913!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0, borderRadius: '10px' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </MapSection>

      <ContactSection>
        <ContactGrid>
          <ContactInfo>
            <InfoCard>
              <IconWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <div>
                <h3>Visit Us</h3>
                <p>Durgapur, West Bengal, India</p>
              </div>
            </InfoCard>

            <InfoCard>
              <IconWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <div>
                <h3>Email Us</h3>
                <p>ecommtest07@gmail.com</p>
              </div>
            </InfoCard>

            <InfoCard>
              <IconWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <div>
                <h3>Call Us</h3>
                <p>Response time: 24-48 hours</p>
              </div>
            </InfoCard>
          </ContactInfo>

          <FormSection>
            <FormCard>
              <h2>Send us a Message</h2>
              
              {/* Test connection button - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <TestButton type="button" onClick={testConnection}>
                  Test Connection
                </TestButton>
              )}

              <ContactForm onSubmit={handleSubmit}>
                <InputGroup>
                  <StyledInput
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    disabled={loading}
                  />
                  <InputIcon>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </InputIcon>
                </InputGroup>

                <InputGroup>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    disabled={loading}
                    style={{ textTransform: 'lowercase' }}
                  />
                  <InputIcon>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </InputIcon>
                </InputGroup>

                <TextAreaGroup>
                  <StyledTextArea
                    name="message"
                    rows="5"
                    placeholder="Write your message here (minimum 10 characters)..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    disabled={loading}
                  />
                  <CharacterCount $isValid={formData.message.length >= 10}>
                    {formData.message.length}/10 characters
                  </CharacterCount>
                </TextAreaGroup>

                {feedback.message && (
                  <FeedbackMessage type={feedback.type}>
                    <FeedbackIcon type={feedback.type}>
                      {feedback.type === "success" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </FeedbackIcon>
                    {feedback.message}
                  </FeedbackMessage>
                )}

                <SubmitButton type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
                      </svg>
                    </>
                  )}
                </SubmitButton>
              </ContactForm>
            </FormCard>
          </FormSection>
        </ContactGrid>
      </ContactSection>
    </Wrapper>
  );
};

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Wrapper = styled.section`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 0;
`;

const HeaderSection = styled.div`
  text-align: center;
  padding: 2.5rem 2rem;
  color: white;
  animation: ${fadeInUp} 0.8s ease-out;

  .main-heading {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.8rem;
    background: linear-gradient(135deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .heading-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    .main-heading {
      font-size: 2.2rem;
    }
    .heading-subtitle {
      font-size: 1rem;
    }
  }
`;

const MapSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;

  iframe {
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
    }
  }

  @media (max-width: 768px) {
    padding: 0 1rem;
    
    iframe {
      height: 250px;
    }
  }
`;

const ContactSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  p {
    opacity: 0.8;
    line-height: 1.4;
    font-size: 0.9rem;
  }
`;

const IconWrapper = styled.div`
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);

  svg {
    color: white;
  }
`;

const FormSection = styled.div`
  display: flex;
  justify-content: center;
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 650px;

  h2 {
    text-align: center;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    
    h2 {
      font-size: 1.6rem;
      margin-bottom: 1.5rem;
    }
  }
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  pointer-events: none;
  z-index: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 2.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: #333;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: #8b95a1;
    font-size: 0.95rem;
  }
`;

const TextAreaGroup = styled.div`
  position: relative;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 110px;
  transition: all 0.3s ease;
  color: #333;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: #8b95a1;
    font-size: 0.95rem;
  }
`;

const CharacterCount = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.75rem;
  color: ${props => props.$isValid ? '#28a745' : '#dc3545'};
  background: rgba(255, 255, 255, 0.9);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  backdrop-filter: blur(5px);
  font-weight: 500;
`;

const FeedbackMessage = styled.div`
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  animation: ${fadeInUp} 0.3s ease-out;
  
  background-color: ${props => 
    props.type === "success" ? "#d4edda" : "#f8d7da"
  };
  
  color: ${props => 
    props.type === "success" ? "#155724" : "#721c24"
  };
  
  border: 1px solid ${props => 
    props.type === "success" ? "#c3e6cb" : "#f5c6cb"
  };
`;

const FeedbackIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: ${props => 
      props.type === "success" ? "#28a745" : "#dc3545"
    };
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 52px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
    animation: ${pulse} 2s infinite;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    animation: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const TestButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #5a6268;
  }
`;

export default Contact;