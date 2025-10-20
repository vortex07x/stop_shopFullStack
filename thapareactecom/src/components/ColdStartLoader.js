import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const ColdStartLoader = ({ isWarmingUp }) => {
  const [dots, setDots] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isWarmingUp) {
      setDots("");
      setElapsed(0);
      return;
    }

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Timer
    const timerInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timerInterval);
    };
  }, [isWarmingUp]);

  if (!isWarmingUp) return null;

  return (
    <LoaderOverlay>
      <LoaderContainer>
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
        <Title>Waking Up the Server{dots}</Title>
        <Description>
          Our free server sleeps after inactivity. This may take up to 50 seconds.
        </Description>
        <Timer>Elapsed: {elapsed}s</Timer>
        <ProgressBar>
          <ProgressFill elapsed={elapsed} />
        </ProgressBar>
        <Tip>☕ Grab a coffee while we get things ready!</Tip>
      </LoaderContainer>
    </LoaderOverlay>
  );
};

export default ColdStartLoader;

// Animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const LoaderOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease;
`;

const LoaderContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 3rem;
  border-radius: 2rem;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease;

  @media (max-width: 768px) {
    padding: 3rem 2rem;
    max-width: 90%;
  }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    border-width: 4px;
  }
`;

const Title = styled.h2`
  color: #fff;
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  animation: ${pulse} 2s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.5rem;
  margin-bottom: 2rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Timer = styled.div`
  color: #ffd700;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 10px;
  width: ${({ elapsed }) => Math.min((elapsed / 50) * 100, 100)}%;
  transition: width 1s linear;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
`;

const Tip = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.4rem;
  font-style: italic;
  margin-top: 1rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;