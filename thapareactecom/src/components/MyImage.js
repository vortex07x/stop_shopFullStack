import React, { useState } from "react";
import styled from "styled-components";

const MyImage = ({ imgs = [{ url: "" }] }) => {
  const [mainImage, setMainImage] = useState(imgs[0]);

  return (
    <Wrapper>
      <div className="grid grid-four-column">
        {imgs.map((curElm, index) => {
          return (
            <figure>
              <img
                src={curElm.url}
                alt={curElm.filename}
                className="box-image--style"
                key={index}
                onClick={() => setMainImage(curElm)}
              />
            </figure>
          );
        })}
      </div>
      {/* 2nd column  */}

      <div className="main-screen">
        <img src={mainImage.url} alt={mainImage.filename} />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 0.35fr 1fr;
  gap: 1.5rem;
  align-items: start;

  /* Thumbnail Grid */
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;

    figure {
      position: relative;
      border-radius: 0.5rem;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
      border-radius: 0.5rem;
      border: 2px solid transparent;
      transition: border-color 0.3s ease;

      &:hover {
        border-color: ${({ theme }) => theme.colors.helper};
      }
    }
  }

  /* Active Thumbnail Highlight */
  .box-image--style.active {
    border-color: ${({ theme }) => theme.colors.btn};
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  }

  /* Main Image */
  .main-screen {
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 100%;
      max-height: 50rem;
      object-fit: contain;
      border-radius: 1rem;
      box-shadow: ${({ theme }) => theme.colors.shadow};
      transition: transform 0.4s ease;

      &:hover {
        transform: scale(1.03);
      }
    }
  }

  /* Responsive */
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    grid-template-columns: 1fr;
    gap: 2rem;

    .grid-four-column {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: 1fr;
    }
  }
`;

export default MyImage;