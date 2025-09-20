import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { AiOutlineStar } from "react-icons/ai";
import styled from "styled-components";

const Star = ({ stars, reviews }) => {
  const ratingStar = Array.from({ length: 5 }, (elem, index) => {
    let number = index + 0.5;
    // debugger;
    return (
      <span key={index}>
        {stars >= index + 1 ? (
          <FaStar className="icon" />
        ) : stars >= number ? (
          <FaStarHalfAlt className="icon" />
        ) : (
          <AiOutlineStar className="icon" />
        )}
      </span>
    );
  });

  return (
    <Wrapper>
      <div className="icon-style">
        {ratingStar}
        <p>({reviews} customer reviews)</p>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .icon-style {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .icon {
      font-size: 2.2rem;
      color: #ffb400; /* brighter gold tone */
      transition: transform 0.2s ease;
    }

    span:hover .icon {
      transform: scale(1.2);
    }

    p {
      margin: 0;
      padding-left: 0.8rem;
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

export default Star;