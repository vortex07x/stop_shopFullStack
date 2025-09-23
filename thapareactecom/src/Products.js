import React, { useState, useEffect } from "react";
import styled from "styled-components";
import FilterSection from "./components/FilterSection";
import ProductList from "./components/ProductList";
import Sort from "./components/Sort";
import SearchBar from "./components/SearchBar";
import { FiFilter, FiX } from "react-icons/fi";

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Close filter drawer if screen becomes desktop
      if (window.innerWidth > 768) {
        setIsFilterOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Prevent body scroll when filter is open on mobile
  useEffect(() => {
    if (isMobile && isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isFilterOpen]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  return (
    <Wrapper>
      {/* Mobile Filter Overlay */}
      {isMobile && isFilterOpen && (
        <div className="filter-overlay" onClick={closeFilter} />
      )}

      <div className="container grid grid-filter-column">
        {/* Desktop Filter Section */}
        <div className={`filter-section ${isMobile ? 'mobile-hidden' : ''}`}>
          <FilterSection />
        </div>

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <div className={`mobile-filter-drawer ${isFilterOpen ? 'open' : ''}`}>
            <div className="filter-drawer-header">
              <h2>Filters</h2>
              <button className="close-filter-btn" onClick={closeFilter}>
                <FiX size={24} />
              </button>
            </div>
            <div className="filter-drawer-content">
              <FilterSection onFilterChange={closeFilter} />
            </div>
          </div>
        )}

        <section className="product-view--sort">
          {/* Top bar with SearchBar and Filter button */}
          <div className="top-bar">
            <div className="search-container">
              <SearchBar />
            </div>
            
            {/* Mobile Filter Toggle Button */}
            {isMobile && (
              <button className="mobile-filter-toggle" onClick={toggleFilter}>
                <FiFilter size={20} />
                <span>Filter</span>
              </button>
            )}
          </div>

          <div className="sort-filter">
            <Sort />
          </div>

          <div className="main-product">
            <ProductList />
          </div>
        </section>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  position: relative;

  .grid-filter-column {
    grid-template-columns: 0.2fr 1fr;
    gap: 2rem;
  }

  /* Filter Overlay for Mobile */
  .filter-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    backdrop-filter: blur(2px);
  }

  /* Desktop Filter Section */
  .filter-section {
    position: sticky;
    top: 2rem;
    height: fit-content;
  }

  /* Top Bar Container */
  .top-bar {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
  }

  .search-container {
    flex: 1;
  }

  /* Mobile Filter Toggle Button */
  .mobile-filter-toggle {
    display: none;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.2rem;
    background: ${({ theme }) => theme.colors.white};
    border: 2px solid ${({ theme }) => theme.colors.helper};
    border-radius: 0.6rem;
    color: ${({ theme }) => theme.colors.helper};
    font-weight: 600;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
      background: ${({ theme }) => theme.colors.helper};
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* Mobile Filter Drawer */
  .mobile-filter-drawer {
    position: fixed;
    top: 0;
    left: -100%;
    width: 320px;
    height: 100vh;
    background: ${({ theme }) => theme.colors.bg};
    z-index: 999;
    transition: left 0.3s ease-in-out;
    overflow-y: auto;
    border-right: 1px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);

    &.open {
      left: 0;
    }

    /* Custom scrollbar for filter drawer */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colors.bg};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.helper}40;
      border-radius: 3px;

      &:hover {
        background: ${({ theme }) => theme.colors.helper}60;
      }
    }
  }

  .filter-drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border || '#e2e8f0'};
    background: ${({ theme }) => theme.colors.white || '#fff'};
    position: sticky;
    top: 0;
    z-index: 10;

    h2 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
    }

    .close-filter-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: ${({ theme }) => theme.colors.text};
      border-radius: 0.4rem;
      transition: all 0.2s ease;

      &:hover {
        background: ${({ theme }) => theme.colors.helper}10;
        color: ${({ theme }) => theme.colors.helper};
      }
    }
  }

  .filter-drawer-content {
    padding: 0 2rem 2rem;
  }

  /* Mobile Styles */
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .grid-filter-column {
      grid-template-columns: 1fr;
      gap: 0;
    }

    /* Hide desktop filter on mobile */
    .mobile-hidden {
      display: none;
    }

    /* Show mobile filter toggle */
    .mobile-filter-toggle {
      display: flex;
    }

    .top-bar {
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .search-container {
      flex: 1;
      min-width: 200px;
    }

    /* Adjust mobile drawer width for smaller screens */
    .mobile-filter-drawer {
      width: 85vw;
      max-width: 320px;
    }
  }

  /* Extra small mobile devices */
  @media (max-width: 480px) {
    .mobile-filter-drawer {
      width: 90vw;
    }

    .filter-drawer-header {
      padding: 1.2rem 1.5rem;

      h2 {
        font-size: 1.6rem;
      }
    }

    .filter-drawer-content {
      padding: 0 1.5rem 2rem;
    }

    .mobile-filter-toggle {
      font-size: 1.3rem;
      padding: 0.7rem 1rem;
    }

    .top-bar {
      gap: 0.8rem;
    }
  }

  /* Very small screens */
  @media (max-width: 360px) {
    .mobile-filter-drawer {
      width: 95vw;
    }

    .top-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .mobile-filter-toggle {
      align-self: flex-end;
      width: fit-content;
    }
  }
`;

export default Products;