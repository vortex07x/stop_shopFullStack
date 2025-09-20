import styled from "styled-components";
import { useFilterContext } from "../context/filter_context";
import { FaCheck } from "react-icons/fa";
import FormatPrice from "../Helpers/FormatPrice";
import { Button } from "../styles/Button";

const FilterSection = () => {
  const {
    filters: { text, category, color, price, maxPrice, minPrice },
    updateFilterValue,
    all_products,
    clearFilters,
  } = useFilterContext();

  // helper function: get unique values
  const getUniqueData = (data, attr) => {
    let newVal = data.map((curElem) => curElem[attr]);
    if (attr === "colors") newVal = newVal.flat();
    return ["all", ...new Set(newVal)];
  };

  const categoryData = getUniqueData(all_products, "category");
  const companyData = getUniqueData(all_products, "company");
  const colorsData = getUniqueData(all_products, "colors");

  return (
    <Wrapper>
      {/* Search */}
      {/* <div className="filter-search">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            name="text"
            placeholder="Search products..."
            value={text}
            onChange={updateFilterValue}
          />
        </form>
      </div> */}

      {/* Category */}
      <div className="filter-category">
        <h3>Category</h3>
        <div>
          {categoryData.map((curElem, index) => (
            <button
              key={index}
              type="button"
              name="category"
              value={curElem}
              className={curElem === category ? "active" : ""}
              onClick={updateFilterValue}
            >
              {curElem}
            </button>
          ))}
        </div>
      </div>

      {/* Company */}
      <div className="filter-company">
        <h3>Company</h3>
        <form>
          <select
            name="company"
            id="company"
            className="filter-company--select"
            onChange={updateFilterValue}
          >
            {companyData.map((curElem, index) => (
              <option key={index} value={curElem}>
                {curElem}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Colors */}
      <div className="filter-colors colors">
        <h3>Colors</h3>
        <div className="filter-color-style">
          {colorsData.map((curColor, index) => {
            if (curColor === "all") {
              return (
                <button
                  key={index}
                  type="button"
                  value={curColor}
                  name="color"
                  className="color-all--style"
                  onClick={updateFilterValue}
                >
                  All
                </button>
              );
            }
            return (
              <button
                key={index}
                type="button"
                value={curColor}
                name="color"
                style={{ backgroundColor: curColor }}
                className={color === curColor ? "btnStyle active" : "btnStyle"}
                onClick={updateFilterValue}
              >
                {color === curColor ? <FaCheck className="checkStyle" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="filter_price">
        <h3>Price</h3>
        <p>
          <FormatPrice price={price} />
        </p>
        <input
          type="range"
          name="price"
          min={minPrice}
          max={maxPrice}
          value={price}
          onChange={updateFilterValue}
        />
      </div>

      {/* Clear Filters */}
      <div className="filter-clear">
        <Button className="btn" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 5rem 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;

  h3 {
    padding: 1rem 0;
    font-weight: 600;
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.text};
  }

  /* 🔹 Search Input */
  .filter-search {
    input {
      padding: 0.9rem 1rem;
      width: 100%;
      border: 1px solid #d1d5db;
      border-radius: 0.6rem;
      outline: none;
      transition: border 0.3s ease, box-shadow 0.3s ease;
      font-size: 1.4rem;
      line-height: 1.6rem;
      height: 3.6rem;

      &::placeholder {
        color: #9ca3af;
        font-size: 1.3rem;
      }

      &:focus {
        border: 1px solid ${({ theme }) => theme.colors.btn};
        box-shadow: 0 0 0 2px rgba(98, 84, 243, 0.2);
      }
    }
  }

  /* 🔹 Category */
  .filter-category {
    div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;

      button {
        border: none;
        background-color: transparent;
        text-transform: capitalize;
        font-size: 1.4rem;
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: ${({ theme }) => theme.colors.btn};
        }
      }

      .active {
        font-weight: 600;
        border-left: 3px solid ${({ theme }) => theme.colors.btn};
        padding-left: 0.5rem;
        color: ${({ theme }) => theme.colors.btn};
      }
    }
  }

  /* 🔹 Company Dropdown */
  .filter-company--select {
    padding: 0.6rem 1.2rem;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.text};
    text-transform: capitalize;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    outline: none;

    &:focus {
      border: 1px solid ${({ theme }) => theme.colors.btn};
      box-shadow: 0 0 0 2px rgba(98, 84, 243, 0.2);
    }
  }

  /* 🔹 Colors */
  .filter-color-style {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }

  .color-all--style {
    background-color: transparent;
    text-transform: capitalize;
    border: 1px solid #d1d5db;
    border-radius: 0.4rem;
    padding: 0.2rem 0.6rem;
    font-size: 1.3rem;
    cursor: pointer;

    &:hover {
      border-color: ${({ theme }) => theme.colors.btn};
      color: ${({ theme }) => theme.colors.btn};
    }
  }

  .btnStyle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    outline: none;
    opacity: 0.6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 1;
    }
  }

  .active {
    opacity: 1;
    border: 2px solid ${({ theme }) => theme.colors.btn};
  }

  .checkStyle {
    font-size: 1rem;
    color: #fff;
  }

  /* 🔹 Price Range */
  .filter_price {
    margin-top: 1rem;

    p {
      margin-bottom: 0.6rem;
      font-size: 1.4rem;
      font-weight: 500;
    }

    input[type="range"] {
      width: 100%;
      height: 6px;
      border-radius: 5px;
      background: #e5e7eb;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
    }

    /* Chrome, Edge, Safari */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.btn};
      cursor: pointer;
      border: none;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
    }

    /* Firefox */
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.btn};
      cursor: pointer;
      border: none;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
    }
  }

  /* 🔹 Clear Filters Button */
  .filter-clear .btn {
    background: linear-gradient(135deg, #4f46e5, #3b82f6);
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 0.8rem 1.5rem;
    border-radius: 0.6rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
    }
  }
`; 

export default FilterSection;
