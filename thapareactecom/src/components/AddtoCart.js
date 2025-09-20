import { useState } from "react";
import styled from "styled-components";
import { FaCheck } from "react-icons/fa";
import CartAmountToggle from "./CartAmountToggle";
import { NavLink } from "react-router-dom";
import { Button } from "../styles/Button";
import { useCartContext } from "../context/cart_context";

const AddToCart = ({ product }) => {
  const { addToCart } = useCartContext();

  const { id, colors, stock } = product;

  const [color, setColor] = useState(colors[0]);
  const [amount, setAmount] = useState(1);

  const setDecrease = () => {
    amount > 1 ? setAmount(amount - 1) : setAmount(1);
  };

  const setIncrease = () => {
    amount < stock ? setAmount(amount + 1) : setAmount(stock);
  };

  return (
    <Wrapper>
      <div className="colors">
        <p>
          Color:
          {colors.map((curColor, index) => {
            return (
              <button
                key={index}
                style={{ backgroundColor: curColor }}
                className={color === curColor ? "btnStyle active" : "btnStyle"}
                onClick={() => setColor(curColor)}
              >
                {color === curColor ? <FaCheck className="checkStyle" /> : null}
              </button>
            );
          })}
        </p>
      </div>

      {/* add to cart  */}
      <CartAmountToggle
        amount={amount}
        setDecrease={setDecrease}
        setIncrease={setIncrease}
      />

      <NavLink to="/cart" onClick={() => addToCart(id, color, amount, product)}>
        <Button className="btn">Add To Cart</Button>
      </NavLink>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .colors p {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-weight: 600;
    color: #e0e7ff;
  }

  .btnStyle {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    margin-left: 1rem;
    border: 2px solid #004080;
    outline: none;
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover {
      opacity: 1;
      transform: scale(1.1);
      border: 2px solid #007bff;
      box-shadow: 0 0 8px rgba(0, 123, 255, 0.6);
    }
  }

  .active {
    opacity: 1;
    border: 2px solid #007bff;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.8);
  }

  .checkStyle {
    font-size: 1rem;
    color: #ffffff;
  }

  /* Cart Amount */
  .amount-toggle {
    margin-top: 2rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 1.4rem;

    button {
      border: none;
      background: linear-gradient(135deg, #007bff, #004080);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #3399ff, #0056b3);
        transform: scale(1.1);
      }
    }

    .amount-style {
      font-size: 2.4rem;
      color: #61dafb;
      font-weight: bold;
    }
  }

  .btn {
    margin-top: 1.5rem;
    background: linear-gradient(135deg, #007bff, #004080);
    padding: 0.8rem 2rem;
    border-radius: 30px;
    font-weight: bold;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #3399ff, #0056b3);
      transform: scale(1.05);
      box-shadow: 0 4px 10px rgba(0, 123, 255, 0.4);
    }
  }
`;

export default AddToCart;
