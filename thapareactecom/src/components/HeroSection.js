import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../styles/Button";

const HeroSection = ({ myData }) => {
  const { name } = myData;

  return (
    <Wrapper>
      <div className="container">
        <div className="grid grid-two-column">
          <div className="hero-section-data">
            <p className="intro-data">Welcome to </p>
            <h1> {name} </h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias
              atque temporibus veniam doloribus libero ad error omnis voluptates
              animi! Suscipit sapiente.
            </p>
            <NavLink to="/products">
              <Button>shop now</Button>
            </NavLink>
          </div>

          {/* homepage image */}
          <div className="hero-section-image">
            <figure>
              <img
                src="images/hero.jpg"
                alt="hero-section-photo"
                className="img-style"
              />
            </figure>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 12rem 0;

  img {
    min-width: 10rem;
    height: 10rem;
  }

  .hero-section-data {
    p {
      margin: 2rem 0;
    }

    h1 {
      text-transform: capitalize;
      font-weight: bold;
    }

    .intro-data {
      margin-bottom: 0;
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.helper};
    }
  }

  .hero-section-image {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  figure {
    position: relative;

    &::after {
      content: "";
      width: 65%;
      height: 80%;
      background: linear-gradient(
        135deg,
        rgba(0, 123, 255, 0.6),
        rgba(0, 212, 255, 0.4)
      );
      position: absolute;
      left: 50%;
      top: -5rem;
      z-index: -1;
      border-radius: 1.5rem;
      filter: blur(4px);
    }
  }

  .img-style {
    width: 100%;
    height: auto;
    border-radius: 1rem;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .grid {
      gap: 8rem;
    }

    figure::after {
      width: 55%;
      height: 100%;
      left: 0;
      top: 10%;
      background: linear-gradient(
        160deg,
        rgba(0, 123, 255, 0.6),
        rgba(0, 212, 255, 0.4)
      );
    }
  }
`;

export default HeroSection;
