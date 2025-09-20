import styled from "styled-components";

const Trusted = () => {
  return (
    <Wrapper className="brand-section">
      <div className="container">
        <h3>Trusted By 1000+ Companies</h3>
        <div className="brand-section-slider">
          {/* my 1st img  */}
          <div className="slide">
            <img
              src="https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image2.png"
              alt="trusted-brands"
            />
          </div>
          <div className="slide">
            <img
              src="https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image3.png"
              alt="trusted-brands"
            />
          </div>
          <div className="slide">
            <img
              src="https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image4.png"
              alt="trusted-brands"
            />
          </div>
          <div className="slide">
            <img
              src="https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image6.png"
              alt="trusted-brands"
            />
          </div>
          <div className="slide">
            <img
              src="https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image8.png"
              alt="trusted-brands"
            />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 9rem 0;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.bg} 0%,
    #e6f0ff 100%
  );

  .brand-section {
    padding: 12rem 0 0 0;
  }

  h3 {
    text-align: center;
    text-transform: capitalize;
    color: ${({ theme }) => theme.colors.text};
    font-size: 2.4rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  .brand-section-slider {
    margin-top: 3.2rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .slide {
    flex: 0 1 12rem;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      min-width: 8rem;
      height: 8rem;
      object-fit: contain;
      filter: grayscale(100%);
      opacity: 0.8;
      transition: all 0.3s ease-in-out;
      cursor: pointer;

      &:hover {
        filter: grayscale(0%);
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .brand-section-slider {
      grid-template-columns: repeat(2, 1fr);
      display: grid;
      place-items: center;
      gap: 2rem;
    }
  }
`;

export default Trusted;