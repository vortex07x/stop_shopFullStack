import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Button } from "./styles/Button";

const ErrorPage = () => {
  return (
    <Wrapper>
      <div className="container">
        <div className="error-content">
          <h2>404</h2>
          <h3>UH OH! You're lost.</h3>
          <p>
            The page you are looking for does not exist. How you got here is a
            mystery. But you can click the button below to go back to the
            homepage.
          </p>

          <NavLink to="/">
            <Button>Go Back to Home</Button>
          </NavLink>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: ${({ theme }) => theme.colors.bg};

  .container {
    text-align: center;
  }

  .error-content {
    max-width: 60rem;
    margin: 0 auto;
    padding: 3rem;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.08);
  }

  h2 {
    font-size: 12rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.btn};
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 3.6rem;
    color: ${({ theme }) => theme.colors.heading};
    margin-bottom: 1.5rem;
  }

  p {
    margin: 2rem 0 3rem 0;
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.6;
  }

  a button {
    margin-top: 2rem;
  }
`;

export default ErrorPage;
