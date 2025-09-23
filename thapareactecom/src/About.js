import React, { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import HeroSection from "./components/HeroSection";
import { useProductContext } from "./context/productcontex";

const About = () => {
  const { myName } = useProductContext();
  const observerRef = useRef();

  const data = {
    name: "Stop&Shop Ecommerce",
  };

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // Observe all elements with scroll-reveal class
    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      {myName}
      <HeroSection myData={data} />
      
      <AboutWrapper>
        {/* Story Section */}
        <StorySection className="scroll-reveal">
          <div className="container">
            <div className="story-content">
              <div className="story-text">
                <h2>Our Story 📖</h2>
                <p>
                  What started as a small dream has grown into your trusted shopping companion! 
                  Stop&Shop was born from the idea that everyone deserves access to quality products 
                  without breaking the bank. We believe shopping should be fun, easy, and rewarding.
                </p>
                <div className="fun-fact">
                  <span className="emoji">🎯</span>
                  <span>Over 10,000+ happy customers served!</span>
                </div>
              </div>
              <div className="story-image">
                <div className="floating-card">
                  <span className="card-emoji">🛍️</span>
                  <h3>Shop Smart</h3>
                </div>
              </div>
            </div>
          </div>
        </StorySection>

        {/* Values Section */}
        <ValuesSection className="scroll-reveal">
          <div className="container">
            <h2>Why Choose Us? 🌟</h2>
            <div className="values-grid">
              <ValueCard className="value-card">
                <div className="card-icon">🚀</div>
                <h3>Lightning Fast</h3>
                <p>Quick delivery that'll make your neighbors jealous!</p>
              </ValueCard>
              
              <ValueCard className="value-card">
                <div className="card-icon">💎</div>
                <h3>Premium Quality</h3>
                <p>Only the finest products make it to our shelves!</p>
              </ValueCard>
              
              <ValueCard className="value-card">
                <div className="card-icon">🎉</div>
                <h3>Amazing Deals</h3>
                <p>Prices so good, you'll think it's your birthday!</p>
              </ValueCard>
              
              <ValueCard className="value-card">
                <div className="card-icon">🤝</div>
                <h3>24/7 Support</h3>
                <p>We're here for you, even when you're shopping at 3 AM!</p>
              </ValueCard>
            </div>
          </div>
        </ValuesSection>

        {/* Fun Facts Section */}
        <FunFactsSection className="scroll-reveal">
          <div className="container">
            <h2>Some Fun Numbers 📊</h2>
            <div className="facts-grid">
              <FactCard>
                <div className="fact-number">1M+</div>
                <div className="fact-label">Products Delivered</div>
                <div className="fact-emoji">📦</div>
              </FactCard>
              
              <FactCard>
                <div className="fact-number">50K+</div>
                <div className="fact-label">Happy Customers</div>
                <div className="fact-emoji">😊</div>
              </FactCard>
              
              <FactCard>
                <div className="fact-number">99.9%</div>
                <div className="fact-label">Satisfaction Rate</div>
                <div className="fact-emoji">⭐</div>
              </FactCard>
              
              <FactCard>
                <div className="fact-number">24/7</div>
                <div className="fact-label">Support Available</div>
                <div className="fact-emoji">🎧</div>
              </FactCard>
            </div>
          </div>
        </FunFactsSection>

        {/* Team Section */}
        <TeamSection className="scroll-reveal">
          <div className="container">
            <h2>Meet Our Awesome Team 👨‍💻👩‍💻</h2>
            <div className="team-grid">
              <TeamMember>
                <div className="member-avatar">🧑‍💼</div>
                <h3>Alex Johnson</h3>
                <p>CEO & Founder</p>
                <div className="member-quote">"Making shopping awesome, one click at a time!"</div>
              </TeamMember>
              
              <TeamMember>
                <div className="member-avatar">👩‍💻</div>
                <h3>Sarah Chen</h3>
                <p>Head of Customer Experience</p>
                <div className="member-quote">"Your happiness is our success metric!"</div>
              </TeamMember>
              
              <TeamMember>
                <div className="member-avatar">🧑‍🔬</div>
                <h3>Mike Rodriguez</h3>
                <p>Quality Assurance Lead</p>
                <div className="member-quote">"If it's not perfect, it's not ready!"</div>
              </TeamMember>
            </div>
          </div>
        </TeamSection>

        {/* Call to Action */}
        <CTASection className="scroll-reveal">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Join Our Community? 🎊</h2>
              <p>Thousands of satisfied customers can't be wrong! Start your shopping journey today.</p>
              <div className="cta-buttons">
                <a href="/products" className="cta-btn primary">Start Shopping</a>
                <a href="/contact" className="cta-btn secondary">Get in Touch</a>
              </div>
            </div>
          </div>
        </CTASection>
      </AboutWrapper>
    </>
  );
};

export default About;

// Keyframes for animations
const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// Styled Components
const AboutWrapper = styled.div`
  .scroll-reveal {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease-out;
    
    &.animate {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
`;

const StorySection = styled.section`
  padding: 8rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

  .story-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  .story-text {
    h2 {
      font-size: 3.5rem;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 2rem;
    }

    p {
      font-size: 1.8rem;
      line-height: 1.6;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 3rem;
    }
  }

  .fun-fact {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .emoji {
      font-size: 3rem;
    }

    span:last-child {
      font-size: 1.6rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.helper};
    }
  }

  .floating-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 3rem 2rem;
    border-radius: 2rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: ${float} 3s ease-in-out infinite;

    .card-emoji {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 2.4rem;
      margin: 0;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .story-content {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }
`;

const ValuesSection = styled.section`
  padding: 8rem 0;
  background: white;

  h2 {
    text-align: center;
    font-size: 3.5rem;
    margin-bottom: 5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 3rem;
  }
`;

const ValueCard = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 1.5rem;
  background: white;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.helper};
  }

  .card-icon {
    font-size: 5rem;
    margin-bottom: 2rem;
    animation: ${pulse} 2s infinite;
  }

  h3 {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: 1.6rem;
    color: #666;
    line-height: 1.5;
  }
`;

const FunFactsSection = styled.section`
  padding: 8rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h2 {
    text-align: center;
    font-size: 3.5rem;
    margin-bottom: 5rem;
  }

  .facts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 3rem;
  }
`;

const FactCard = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.2);
  }

  .fact-number {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .fact-label {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    opacity: 0.9;
  }

  .fact-emoji {
    font-size: 3rem;
  }
`;

const TeamSection = styled.section`
  padding: 8rem 0;
  background: #f8f9fa;

  h2 {
    text-align: center;
    font-size: 3.5rem;
    margin-bottom: 5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 4rem;
  }
`;

const TeamMember = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }

  .member-avatar {
    font-size: 6rem;
    margin-bottom: 2rem;
  }

  h3 {
    font-size: 2.4rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.helper};
    margin-bottom: 2rem;
    font-weight: 600;
  }

  .member-quote {
    font-style: italic;
    font-size: 1.4rem;
    color: #666;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 1rem;
    border-left: 4px solid ${({ theme }) => theme.colors.helper};
  }
`;

const CTASection = styled.section`
  padding: 8rem 0;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  text-align: center;

  .cta-content {
    max-width: 800px;
    margin: 0 auto;

    h2 {
      font-size: 4rem;
      margin-bottom: 2rem;
    }

    p {
      font-size: 1.8rem;
      margin-bottom: 4rem;
      opacity: 0.9;
    }
  }

  .cta-buttons {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-btn {
    padding: 1.5rem 3rem;
    font-size: 1.6rem;
    font-weight: 600;
    border-radius: 0.8rem;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-block;

    &.primary {
      background: ${({ theme }) => theme.colors.helper};
      color: white;

      &:hover {
        background: ${({ theme }) => theme.colors.helper};
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }
    }

    &.secondary {
      background: transparent;
      color: white;
      border: 2px solid white;

      &:hover {
        background: white;
        color: ${({ theme }) => theme.colors.text};
        transform: translateY(-3px);
      }
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .cta-buttons {
      flex-direction: column;
      align-items: center;

      .cta-btn {
        width: 100%;
        max-width: 300px;
      }
    }
  }
`;