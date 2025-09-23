import styled from "styled-components";
import { useFilterContext } from "../context/filter_context";
import { FaCheck } from "react-icons/fa";
import FormatPrice from "../Helpers/FormatPrice";
import { Button } from "../styles/Button";

const FilterSection = ({ onFilterChange }) => {
  const {
    filters: { text, category, color, price, maxPrice, minPrice },
    updateFilterValue,
    all_products,
    clearFilters,
  } = useFilterContext();

  // Enhanced updateFilterValue that can trigger mobile drawer close
  const handleFilterUpdate = (e) => {
    updateFilterValue(e);
    
    // For certain filter types, close mobile drawer after selection
    if (onFilterChange && (e.target.name === 'category' || e.target.name === 'company')) {
      // Small delay to let the filter update complete
      setTimeout(() => {
        onFilterChange();
      }, 100);
    }
  };

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
              onClick={handleFilterUpdate}
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
            onChange={handleFilterUpdate}
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
        <Button 
          className="btn" 
          onClick={(e) => {
            clearFilters();
            // Close mobile drawer after clearing filters
            if (onFilterChange) {
              setTimeout(() => {
                onFilterChange();
              }, 100);
            }
          }}
        >
          Clear Filters
        </Button>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;

  h3 {
    padding: 1rem 0;
    font-weight: 600;
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.text};
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
        transition: all 0.2s ease;
        padding: 0.5rem 0;
        width: 100%;
        text-align: left;

        &:hover {
          color: ${({ theme }) => theme.colors.btn};
        }
      }

      .active {
        font-weight: 600;
        border-left: 3px solid ${({ theme }) => theme.colors.btn};
        padding-left: 1rem;
        color: ${({ theme }) => theme.colors.btn};
        background: ${({ theme }) => theme.colors.helper}10;
        border-radius: 0 0.4rem 0.4rem 0;
      }
    }
  }

  /* 🔹 Company Dropdown */
  .filter-company--select {
    padding: 0.8rem 1.2rem;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.text};
    text-transform: capitalize;
    border-radius: 0.6rem;
    border: 1px solid #d1d5db;
    outline: none;
    width: 100%;
    background: ${({ theme }) => theme.colors.white || '#fff'};
    cursor: pointer;

    &:focus {
      border: 1px solid ${({ theme }) => theme.colors.btn};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.helper}20;
    }

    &:hover {
      border-color: ${({ theme }) => theme.colors.helper};
    }
  }

  /* 🔹 Colors */
  .filter-color-style {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .color-all--style {
    background-color: transparent;
    text-transform: capitalize;
    border: 1px solid #d1d5db;
    border-radius: 0.4rem;
    padding: 0.4rem 0.8rem;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.btn};
      color: ${({ theme }) => theme.colors.btn};
      background: ${({ theme }) => theme.colors.helper}10;
    }
  }

  .btnStyle {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    border: 2px solid transparent;
    outline: none;
    opacity: 0.7;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  .active {
    opacity: 1;
    border: 2px solid ${({ theme }) => theme.colors.btn};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.helper}20;
  }

  .checkStyle {
    font-size: 1rem;
    color: #fff;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }

  /* 🔹 Price Range */
  .filter_price {
    margin-top: 1rem;

    p {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.helper};
      background: ${({ theme }) => theme.colors.helper}10;
      padding: 0.5rem 1rem;
      border-radius: 0.4rem;
      text-align: center;
    }

    input[type="range"] {
      width: 100%;
      height: 8px;
      border-radius: 5px;
      background: #e5e7eb;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      margin: 1rem 0;
    }

    /* Chrome, Edge, Safari */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.btn};
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }

    /* Firefox */
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.btn};
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }

  /* 🔹 Clear Filters Button */
  .filter-clear {
    margin-top: 1rem;
    
    .btn {
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.5px;
      padding: 1rem 2rem;
      border-radius: 0.6rem;
      transition: all 0.3s ease;
      width: 100%;
      font-size: 1.4rem;

      &:hover {
        background: linear-gradient(135deg, #3b82f6, #4f46e5);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  /* Mobile specific adjustments */
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem 0;
    gap: 2.5rem;

    h3 {
      font-size: 1.5rem;
      padding: 0.5rem 0 1rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
      margin-bottom: 1rem;
    }

    .filter-category div {
      gap: 0.8rem;

      button {
        padding: 0.8rem 0;
        font-size: 1.3rem;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border || '#f3f4f6'};

        &.active {
          padding-left: 1.2rem;
        }
      }
    }

    .filter-company--select {
      padding: 1rem 1.2rem;
      font-size: 1.3rem;
    }

    .filter-color-style {
      gap: 0.8rem;
    }

    .btnStyle {
      width: 2.5rem;
      height: 2.5rem;
    }

    .filter_price {
      p {
        font-size: 1.4rem;
        padding: 0.8rem 1rem;
      }

      input[type="range"] {
        height: 10px;
        margin: 1.5rem 0;

        &::-webkit-slider-thumb {
          width: 24px;
          height: 24px;
        }
      }
    }

    .filter-clear .btn {
      padding: 1.2rem 2rem;
      font-size: 1.3rem;
    }
  }
`; 

export default FilterSection;