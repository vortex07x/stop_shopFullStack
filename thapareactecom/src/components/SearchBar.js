import styled from "styled-components";
import { useState } from "react";
import { useFilterContext } from "../context/filter_context";

const SearchBar = () => {
    const { filters: { text }, updateFilterValue, all_products } = useFilterContext();
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filter products dynamically based on search input
    const filteredSuggestions = all_products
        .filter((product) =>
            product.name.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 5); // limit to 5 suggestions

    const handleSuggestionClick = (suggestion) => {
        updateFilterValue({
            target: { name: "text", value: suggestion },
        });
        setShowSuggestions(false);
    };

    return (
        <Wrapper>
            <div className="search-container">
                <input
                    type="text"
                    name="text"
                    value={text}
                    onChange={updateFilterValue}
                    placeholder="Search products..."
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                    <ul className="suggestions">
                        {filteredSuggestions.map((product, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(product.name)}>
                                {product.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.section`
  width: 100%;
  margin: 2rem auto;
  display: flex;
  justify-content: center;

  .search-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    display: flex;
  justify-content: center;
  }

  input {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1.4rem;
    border: 1.5px solid #ccc;
    border-radius: 6px;   /* slight rounded corners */
    outline: none;
    background: #fff;
    color: #333;
    transition: all 0.2s ease;

    &::placeholder {
      color: #aaa;
      font-size: 1.3rem;
    }

    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 6px rgba(0, 123, 255, 0.2);
    }
  }

  .suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;   /* ✅ match input width */
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  margin-top: -1px;
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 99;
}

  .suggestions li {
    padding: 0.8rem 1.2rem;
    font-size: 1.4rem;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #f0f0f0;
    }
  }
`;

export default SearchBar;
