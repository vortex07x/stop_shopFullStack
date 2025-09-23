// src/components/Marquee.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

const Marquee = () => {
  return (
    <MarqueeWrapper>
      <MarqueeContainer>
        <MarqueeText>
          ⚡ If you face any issues, just refresh the page or logout then login ⚡
        </MarqueeText>
      </MarqueeContainer>
    </MarqueeWrapper>
  );
};

export default Marquee;

// Keyframes for smooth right-to-left scrolling
const scroll = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled components
const MarqueeWrapper = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid rgba(255, 255, 255, 0.1);
  
  /* Subtle animated background */
  background-size: 400% 400%;
  animation: ${gradientShift} 8s ease infinite;
  
  /* Ensure it stays at the top after navbar */
  z-index: 100;
`;

const MarqueeContainer = styled.div`
  width: 100%;
  white-space: nowrap;
  position: relative;
`;

const MarqueeText = styled.div`
  display: inline-block;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  animation: ${scroll} 15s linear infinite;
  padding-left: 50%; /* Reduced from 100% to 50% for quicker return */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  /* Responsive font sizes */
  @media (max-width: 768px) {
    font-size: 1.4rem;
    animation-duration: 12s; /* Faster on mobile */
    padding-left: 40%;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    animation-duration: 10s; /* Even faster on small screens */
    padding-left: 30%;
    padding: 0.2rem 0;
  }
  
  /* Pause animation on hover for better readability */
  &:hover {
    animation-play-state: paused;
  }
  
  /* Add a subtle glow effect */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    border-radius: inherit;
    z-index: -1;
  }
`;