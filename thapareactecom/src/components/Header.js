import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import Nav from "./Nav";

const Header = () => {
  return (
    <MainHeader>
      <NavLink to="/" className="logo-link">
        <img src="./images/selflogo.jpg" alt="my logo img" className="selflogo" />
      </NavLink>
      <Nav />
    </MainHeader>
  );
};

const MainHeader = styled.header`
  padding: 0 4.8rem;
  height: 10rem;
  background-color: ${({ theme }) => theme.colors.bg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  .selflogo {
    height: 5rem;
    mix-blend-mode: multiply;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: scale(1.1) rotate(2deg);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
    }
  }
`;

export default Header;
  