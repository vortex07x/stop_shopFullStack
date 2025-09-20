import React from "react";
import styled from "styled-components";
import { BsFillGridFill, BsList } from "react-icons/bs";
import { useFilterContext } from "../context/filter_context";

const Sort = () => {
  const { filter_products, grid_view, setGridView, setListView, sorting } =
    useFilterContext();
  return (
    <Wrapper className="sort-section">
      {/* 1st column  */}
      <div className="sorting-list--grid">
        <button
          className={grid_view ? "active sort-btn" : "sort-btn"}
          onClick={setGridView}>
          <BsFillGridFill className="icon" />
        </button>

        <button
          className={!grid_view ? "active sort-btn" : " sort-btn"}
          onClick={setListView}>
          <BsList className="icon" />
        </button>
      </div>
      {/* 2nd column  */}
      <div className="product-data">
        <p>{`${filter_products.length} Product Available`}</p>
      </div>

      {/* 3rd column  */}
      <div className="sort-selection">
        <form action="#">
          <label htmlFor="sort"></label>
          <select
            name="sort"
            id="sort"
            className="sort-selection--style"
            onClick={sorting}>
            <option value="lowest">Price(lowest)</option>
            <option value="#" disabled></option>
            <option value="highest">Price(highest)</option>
            <option value="#" disabled></option>
            <option value="a-z">Price(a-z)</option>
            <option value="#" disabled></option>
            <option value="z-a">Price(z-a)</option>
          </select>
        </form>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4rem 0;
  flex-wrap: wrap;
  gap: 2rem;

  .sorting-list--grid {
    display: flex;
    gap: 1.2rem;

    .sort-btn {
      width: 4rem;
      height: 4rem;
      border-radius: 0.8rem;
      border: 1px solid ${({ theme }) => theme.colors.helper};
      background: #fff;
      color: ${({ theme }) => theme.colors.helper};
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 114, 255, 0.1);
      }
    }

    .icon {
      font-size: 1.8rem;
    }

    .active {
      background: linear-gradient(135deg, #0072ff, #00c6ff);
      color: #fff;
      border: none;
      box-shadow: 0 4px 10px rgba(0, 114, 255, 0.3);
    }
  }

  .product-data {
    font-size: 1.6rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }

  .sort-selection {
    .sort-selection--style {
      padding: 0.8rem 1.2rem;
      font-size: 1.6rem;
      border-radius: 0.6rem;
      border: 1px solid ${({ theme }) => theme.colors.helper};
      background: #fff;
      color: ${({ theme }) => theme.colors.text};
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #0072ff;
        box-shadow: 0 2px 6px rgba(0, 114, 255, 0.2);
      }
    }
  }
`;

export default Sort;