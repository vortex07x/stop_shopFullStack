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
    
    // Keep username as entered (don't auto-capitalize)
    if (name === "username") {
      processedValue = value; // Keep original case
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

      const response = await fetch("https://stopshopfullstack-production.up.railway.app/api/contact/send", {
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
      const response = await fetch("https://stopshopfullstack-production.up.railway.app/api/contact/test", {
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
      <Container>
        <HeaderSection>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </HeaderSection>

        <ContentGrid>
          {/* Contact Information */}
          <ContactInfo>
            <InfoCard>
              <IconWrapper>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </IconWrapper>
              <div>
                <h3>Our Location</h3>
                <p>Durgapur, West Bengal, India</p>
              </div>
            </InfoCard>

            <InfoCard>
              <IconWrapper>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </IconWrapper>
              <div>
                <h3>Email Address</h3>
                <p>ecommtest07@gmail.com</p>
              </div>
            </InfoCard>

            <InfoCard>
              <IconWrapper>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </IconWrapper>
              <div>
                <h3>Response Time</h3>
                <p>24-48 hours</p>
              </div>
            </InfoCard>

            {/* Map Section */}
            <MapContainer>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117057.26374724657!2d87.21777250612621!3d23.531081960239405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f7710b47a89171%3A0x429e1bdb57e009dd!2sDurgapur%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1713935550913!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </MapContainer>
          </ContactInfo>

          {/* Contact Form */}
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
                  <label>Full Name</label>
                  <StyledInput
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Email Address</label>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Message</label>
                  <StyledTextArea
                    name="message"
                    rows="6"
                    placeholder="Write your message here (minimum 10 characters)..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <CharacterCount $isValid={formData.message.length >= 10}>
                    {formData.message.length}/10 characters
                  </CharacterCount>
                </InputGroup>

                {feedback.message && (
                  <FeedbackMessage type={feedback.type}>
                    <FeedbackIcon type={feedback.type}>
                      {feedback.type === "success" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
                      </svg>
                    </>
                  )}
                </SubmitButton>
              </ContactForm>
            </FormCard>
          </FormSection>
        </ContentGrid>
      </Container>
    </Wrapper>
  );
};

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
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

// Styled Components
const Wrapper = styled.section`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 4rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.6s ease-out;

  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    margin-bottom: 3rem;
    
    h1 {
      font-size: 2.4rem;
    }
    
    p {
      font-size: 1.1rem;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 4rem;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    
    h3 {
      font-size: 1.2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  svg {
    color: white;
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const MapContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;

  iframe {
    width: 100%;
    border-radius: 8px;
    min-height: 300px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    
    iframe {
      height: 250px;
    }
  }
`;

const FormSection = styled.div`
  display: flex;
  justify-content: center;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid #f0f0f0;

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 2.5rem;
    color: #333;
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 2.5rem;
    
    h2 {
      font-size: 1.8rem;
      margin-bottom: 2rem;
    }
  }
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const InputGroup = styled.div`
  position: relative;

  label {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.8rem;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1.4rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: white;
  color: #333;
  font-family: inherit;
  text-transform: none;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: #999;
    text-transform: none;
  }

  /* Prevent auto-capitalization on mobile */
  &[name="username"] {
    text-transform: none;
    autocapitalize: words;
  }

  &[name="email"] {
    text-transform: lowercase;
    autocapitalize: none;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 1.4rem 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
  transition: all 0.3s ease;
  color: #333;
  line-height: 1.6;
  text-transform: none;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: #999;
    text-transform: none;
  }
`;

const CharacterCount = styled.div`
  position: absolute;
  bottom: 1.2rem;
  right: 1.2rem;
  font-size: 0.85rem;
  color: ${props => props.$isValid ? '#28a745' : '#dc3545'};
  background: rgba(255, 255, 255, 0.95);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
  backdrop-filter: blur(4px);
`;

const FeedbackMessage = styled.div`
  padding: 1.2rem 1.4rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 1rem;
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
  padding: 1.4rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 64px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const TestButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #5a6268;
  }
`;

export default Contact;