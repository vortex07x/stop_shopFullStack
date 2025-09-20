import React from "react";
import styled from "styled-components";
import Product from "./Product";

const GridView = ({ products }) => {
  return (
    <Wrapper className="section">
      <div className="container grid grid-three-column">
        {products.map((curElem) => {
          return <Product key={curElem.id} {...curElem} />;
        })}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 9rem 0;

  .container {
    max-width: 120rem;
  }

  .grid {
    gap: 3.2rem;
  }

  /* 🔹 Product Image Wrapper */
  figure {
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.4s ease;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 0%;
      height: 100%;
      background: linear-gradient(
        to right,
        rgba(79, 70, 229, 0.5),
        rgba(59, 130, 246, 0.5)
      );
      transition: width 0.3s ease;
      cursor: pointer;
    }

    &:hover::after {
      width: 100%;
    }

    &:hover img {
      transform: scale(1.08);
    }

    img {
      max-width: 90%;
      margin-top: 1.5rem;
      height: 20rem;
      border-radius: 0.8rem;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  /* 🔹 Card */
  .card {
    background-color: ${({ theme }) => theme.colors.bg};
    border-radius: 1rem;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    }

    .card-data {
      padding: 1rem 1.5rem;
    }

    .card-data-flex {
      margin: 1.5rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-data--price {
      color: ${({ theme }) => theme.colors.btn};
      font-weight: 600;
      font-size: 1.4rem;
    }

    h3 {
      color: ${({ theme }) => theme.colors.text};
      text-transform: capitalize;
      font-size: 1.6rem;
      font-weight: 500;
    }

    /* 🔹 View Button */
    .btn {
      margin: 1.5rem auto;
      padding: 0.6rem 1.5rem;
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      border: none;
      border-radius: 0.6rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
      }

      a {
        color: #fff;
        font-size: 1.4rem;
        font-weight: 500;
        text-decoration: none;
      }
    }
  }
`;

export default GridView;