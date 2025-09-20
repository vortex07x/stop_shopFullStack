import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const PageNavigation = ({ title }) => {
  return (
    <Wrapper>
      <NavLink to="/">Home</NavLink>/{title}
    </Wrapper>
  );
};

const Wrapper = styled.section`
  height: 10rem;
  background: linear-gradient(135deg, #0072ff, #00c6ff); /* blue gradient */
  display: flex;
  align-items: center;
  font-size: 3.2rem;
  padding-left: 2rem;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.5px;

  a {
    font-size: 3.2rem;
    text-decoration: none;
    color: #f0f0f0;
    transition: color 0.3s ease;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
`;


export default PageNavigation;