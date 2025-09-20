import styled from "styled-components";

export const Button = styled.button`
  text-decoration: none;
  max-width: max-content; /* ✅ Button fits its text */
  background-color: rgb(98 84 243);
  color: #fff;
  padding: 1.4rem 2.4rem;
  border: none;
  border-radius: 0.5rem; /* ✅ Optional: rounded corners */
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover,
  &:active {
    box-shadow: ${({ theme }) => theme.colors.shadowSupport};
    transform: scale(0.96);
  }

  a {
    text-decoration: none;
    color: #fff;
    font-size: 1.8rem;
  }
`;
