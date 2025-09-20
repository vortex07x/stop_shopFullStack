import { useProductContext } from "../context/productcontex";
import styled from "styled-components";
import Product from "./Product";

const FeatureProduct = () => {
  const { isLoading, featureProducts } = useProductContext();

  if (isLoading) {
    return <div> ......Loading </div>;
  }

  return (
    <Wrapper className="section">
      <div className="container">
        <div className="intro-data">Check Now!</div>
        <div className="common-heading">Our Feature Services</div>
        <div className="grid grid-three-column">
          {featureProducts.map((curElem) => {
            return <Product key={curElem.id} {...curElem} />;
          })}
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 9rem 0;
  background: linear-gradient(
  to bottom,
  rgba(0, 123, 255, 0.9) 0%,   /* keep strong blue at top */
  rgba(0, 123, 255, 0.8) 30%,  /* mid section still blue */
  #f5f5f5 80%                 /* fade into page bg at bottom */
);

  .container {
    max-width: 120rem;
  }

  .intro-data {
    margin-bottom: 0.7rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #e0e7ff;
  }

  .common-heading {
    color: #ffffff;
    font-size: 2.4rem;
    margin-bottom: 3rem;
    text-align: center;
    font-weight: bold;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  figure {
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.4s ease-in-out;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 0%;
      height: 100%;
      background: rgba(0, 123, 255, 0.4);
      transition: all 0.3s ease-in-out;
      cursor: pointer;
    }

    &:hover::after {
      width: 100%;
    }

    &:hover img {
      transform: scale(1.1);
    }

    img {
      max-width: 90%;
      margin-top: 1.5rem;
      height: 20rem;
      transition: all 0.3s ease-in-out;
      border-radius: 0.5rem;
    }

    .caption {
      position: absolute;
      top: 15%;
      right: 10%;
      text-transform: uppercase;
      background: linear-gradient(135deg, #ffffff, #e6f0ff);
      color: #004080;
      padding: 0.8rem 2rem;
      font-size: 1.2rem;
      font-weight: bold;
      border-radius: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }

  .card {
    background: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 6px 18px rgba(0, 123, 255, 0.3);
    }

    .card-data {
      padding: 0 2rem;
    }

    .card-data-flex {
      margin: 2rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h3 {
      color: #004080;
      text-transform: capitalize;
      font-weight: 600;
    }

    .card-data--price {
      color: #007bff;
      font-weight: bold;
    }

    .btn {
      margin: 2rem auto;
      background: linear-gradient(135deg, #007bff, #004080);
      border: none;
      color: #fff;
      padding: 0.6rem 1.8rem;
      border-radius: 25px;
      font-size: 1.4rem;
      font-weight: 600;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #3399ff, #0056b3);
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
      }

      a {
        color: #fff;
        font-size: 1.4rem;
        text-decoration: none;
      }
    }
  }
`;

export default FeatureProduct;
