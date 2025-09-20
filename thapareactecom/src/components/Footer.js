import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { FaDiscord, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <Wrapper>
      <section className="contact-short">
        <div className="grid grid-two-column">
          <div>
            <h3>Ready to get started?</h3>
            <h3>Talk to us today</h3>
          </div>

          <div>
            <NavLink to="/contact">
              <button className="btn get-started">Get Started</button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* footer main section */}
      <footer>
        <div className="container grid grid-four-column">
          <div className="footer-about">
            <h3>Thapa Technical</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>

          {/* subscribe section */}
          <div className="footer-subscribe">
            <h3>Subscribe to get important updates</h3>
            <form action="#">
              <input type="email" placeholder="Enter Email" required />
              <button type="submit" className="btn">Subscribe</button>
            </form>
          </div>

          {/* social links */}
          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="footer-social--icons">
              <a href="https://discord.com" target="_blank" rel="noreferrer">
                <FaDiscord />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* contact */}
          <div className="footer-contact">
            <h3>Call Us</h3>
            <h3>+91 12345678978</h3>
          </div>
        </div>

        {/* bottom section */}
        <div className="footer-bottom--section">
          <hr />
          <div className="container grid grid-two-column">
            <p>@2025 ThapaTechnical. All Rights Reserved</p>
            <div>
              <p>PRIVACY POLICY</p>
              <p>TERMS & CONDITIONS</p>
            </div>
          </div>
        </div>
      </footer>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .contact-short {
    max-width: 60vw;
    margin: auto;
    padding: 2rem 4rem;
    background: linear-gradient(135deg, #007bff, #004080);
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 64, 128, 0.4);
    transform: translateY(50%);
    color: #fff;

    .grid div:last-child {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .btn {
      padding: 0.8rem 2rem;
      border-radius: 0.5rem; /* rectangle with slight curve */
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .get-started {
      background-color: #fff;
      color: #004080;
      box-shadow: 0 4px 10px rgba(0, 64, 128, 0.2);

      &:hover {
        background-color: #e6e6e6;
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(0, 64, 128, 0.3);
      }
    }
  }

  footer {
    padding: 14rem 0 5rem 0;
    background: linear-gradient(180deg, #001f3f, #000814);
    color: #fff;

    h3 {
      margin-bottom: 1.2rem;
    }

    p {
      color: #d1d1d1;
    }

    .footer-subscribe form {
      display: flex;
      gap: 1rem;

      input {
        flex: 1;
        padding: 0.8rem 1.2rem;
        border-radius: 0.5rem; /* match button style */
        border: none;
        outline: none;
      }

      button {
        background: linear-gradient(135deg, #1e90ff, #007bff);
        color: #fff;
        font-weight: 600;
        padding: 0.8rem 2rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(30, 144, 255, 0.4);
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(135deg, #3399ff, #0056b3);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(30, 144, 255, 0.6);
        }
      }
    }

    .footer-social--icons {
      display: flex;
      gap: 1.2rem;

      a {
        font-size: 2rem;
        color: #fff;
        transition: color 0.3s ease;

        &:hover {
          color: #3399ff;
        }
      }
    }

    .footer-bottom--section {
      padding-top: 3rem;

      hr {
        margin-bottom: 2rem;
        border: 0.5px solid #444;
      }

      p {
        font-size: 1.2rem;
      }

      div {
        display: flex;
        gap: 2rem;
      }
    }
  }
`;

export default Footer;
