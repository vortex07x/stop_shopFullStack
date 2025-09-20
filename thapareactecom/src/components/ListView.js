import { NavLink } from "react-router-dom";
import styled from "styled-components";
import FormatPrice from "../Helpers/FormatPrice";
import { Button } from "../styles/Button";

const ListView = ({ products }) => {
  return (
    <Wrapper className="section">
      <div className="container grid">
        {products.map((curElem) => {
          const { id, name, image, price, description } = curElem;
          return (
            <div className="card grid grid-two-column">
              <figure>
                <img src={image} alt={name} />
              </figure>

              <div className="card-data">
                <h3>{name}</h3>
                <p>
                  <FormatPrice price={price} />
                </p>
                <p>{description.slice(0, 90)}...</p>

                <NavLink to={`/singleproduct/${id}`} className="btn-main">
                  <Button className="btn">Read More</Button>
                </NavLink>
              </div>
            </div>
          );
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

  figure {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.4s ease, box-shadow 0.4s ease;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 0%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(0, 123, 255, 0.4),
        rgba(0, 212, 255, 0.3)
      );
      transition: width 0.3s ease;
      border-radius: 1rem;
    }

    &:hover::after {
      width: 100%;
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 20px rgba(0, 123, 255, 0.2);
    }

    &:hover img {
      transform: scale(1.08);
    }

    img {
      width: 90%;
      margin-top: 1.5rem;
      height: 20rem;
      object-fit: cover;
      border-radius: 0.8rem;
      transition: transform 0.3s ease;
    }
  }

  .card {
    border: none;
    border-radius: 1rem;
    background: ${({ theme }) => theme.colors.bg};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
    }

    .card-data {
      padding: 2rem;
    }

    h3 {
      margin: 1.5rem 0 1rem;
      font-weight: 600;
      font-size: 2rem;
      text-transform: capitalize;
      color: ${({ theme }) => theme.colors.text};
    }

    p {
      color: ${({ theme }) => theme.colors.text};
      opacity: 0.9;
    }

    .btn {
      margin: 2rem 0;
      background: linear-gradient(
        135deg,
        rgba(0, 123, 255, 0.85),
        rgba(0, 212, 255, 0.85)
      );
      border: none;
      border-radius: 2rem;
      padding: 0.8rem 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-weight: 500;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(
          135deg,
          rgba(0, 123, 255, 1),
          rgba(0, 212, 255, 1)
        );
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
      }

      a {
        color: #fff;
        font-size: 1.4rem;
      }
    }
  }
`;

export default ListView;