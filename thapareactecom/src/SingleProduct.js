import { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useProductContext } from "./context/productcontex";
import PageNavigation from "./components/PageNavigation";
import MyImage from "./components/MyImage";
import { Container } from "./styles/Container";
import FormatPrice from "./Helpers/FormatPrice";
import { MdSecurity } from "react-icons/md";
import { TbTruckDelivery, TbReplace } from "react-icons/tb";
import Star from "./components/Star";
import AddToCart from "./components/AddtoCart";

const API = "https://api.pujakaitem.com/api/products";

const SingleProduct = () => {
  const { getSingleProduct, isSingleLoading, singleProduct } =
    useProductContext();

  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);

  const {
    id: alias,
    name,
    company,
    price,
    description,
    category,
    stock,
    stars,
    reviews,
    image,
  } = singleProduct;

  useEffect(() => {
    getSingleProduct(`${API}/${id}`);
  }, [id]);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isSingleLoading) {
    return (
      <div className="page_loading">
        Loading.....
      </div>
    );
  }

  // Desktop layout (original)
  if (!isMobile) {
    return (
      <Wrapper>
        <PageNavigation title={name} />
        <Container className="container">
          <div className="grid grid-two-column">
            {/* product Images */}
            <div className="product-images">
              <MyImage imgs={image} />
            </div>

            {/* product Data */}
            <div className="product-data">
              <h2>{name}</h2>
              <Star stars={stars} reviews={reviews} />

              <p className="product-data-price">
                MRP:
                <del>
                  <FormatPrice price={price + 250000} />
                </del>
              </p>
              <p className="product-data-price product-data-real-price">
                Deal of the Day: <FormatPrice price={price} />
              </p>
              <p>{description}</p>

              <div className="product-data-warranty">
                <div className="product-warranty-data">
                  <TbTruckDelivery className="warranty-icon" />
                  <p>Free Delivery</p>
                </div>

                <div className="product-warranty-data">
                  <TbReplace className="warranty-icon" />
                  <p>30 Days Replacement</p>
                </div>

                <div className="product-warranty-data">
                  <TbTruckDelivery className="warranty-icon" />
                  <p>Fast Delivery</p>
                </div>

                <div className="product-warranty-data">
                  <MdSecurity className="warranty-icon" />
                  <p>2 Year Warranty</p>
                </div>
              </div>

              <div className="product-data-info">
                <p>
                  Available:
                  <span> {stock > 0 ? "In Stock" : "Not Available"}</span>
                </p>
                <p>
                  Brand: <span>{company}</span>
                </p>
                <p>
                  Category: <span>{category}</span>
                </p>
              </div>
              <hr />

              {stock > 0 && <AddToCart product={singleProduct} />}
            </div>
          </div>
        </Container>
      </Wrapper>
    );
  }

  // Mobile layout (enhanced)
  return (
    <Wrapper className="mobile-enhanced">
      <PageNavigation title={name} />
      <Container className="container">
        <div className="grid grid-two-column">
          {/* product Images */}
          <div className="product-images">
            <MyImage imgs={image} />
          </div>

          {/* product Data */}
          <div className="product-data">
            <div className="product-header">
              <h2>{name}</h2>
              <div className="rating-section">
                <Star stars={stars} reviews={reviews} />
              </div>
            </div>

            <div className="price-section">
              <p className="product-data-price original-price">
                MRP: <del><FormatPrice price={price + 250000} /></del>
              </p>
              <p className="product-data-price current-price">
                Deal of the Day: <FormatPrice price={price} />
              </p>
              <div className="savings-badge">
                You Save: <FormatPrice price={250000} />
              </div>
            </div>

            <div className="description-section">
              <p className="description">{description}</p>
            </div>

            <div className="product-data-warranty">
              <div className="warranty-grid">
                <div className="product-warranty-data">
                  <TbTruckDelivery className="warranty-icon" />
                  <p>Free Delivery</p>
                </div>

                <div className="product-warranty-data">
                  <TbReplace className="warranty-icon" />
                  <p>30 Days Replacement</p>
                </div>

                <div className="product-warranty-data">
                  <TbTruckDelivery className="warranty-icon" />
                  <p>Fast Delivery</p>
                </div>

                <div className="product-warranty-data">
                  <MdSecurity className="warranty-icon" />
                  <p>2 Year Warranty</p>
                </div>
              </div>
            </div>

            <div className="product-info-card">
              <div className="product-data-info">
                <div className="info-item">
                  <span className="info-label">Availability:</span>
                  <span className={`info-value ${stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {stock > 0 ? "✓ In Stock" : "✗ Not Available"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Brand:</span>
                  <span className="info-value">{company}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{category}</span>
                </div>
              </div>
            </div>

            {stock > 0 ? (
              <div className="add-to-cart-section">
                <AddToCart product={singleProduct} />
              </div>
            ) : (
              <div className="out-of-stock-message">
                <p>This product is currently out of stock. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  /* Original Desktop Styles */
  .container {
    padding: 9rem 0;
  }

  .product-images {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .product-data {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2rem;

    h2 {
      font-size: 2.8rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .product-data-price {
      font-weight: bold;
      font-size: 1.8rem;
    }

    .product-data-real-price {
      color: ${({ theme }) => theme.colors.btn};
      font-size: 2rem;
    }

    p {
      font-size: 1.6rem;
    }

    .product-data-warranty {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      margin-bottom: 1rem;
      padding-bottom: 1rem;

      .product-warranty-data {
        text-align: center;

        .warranty-icon {
          background-color: ${({ theme }) => theme.colors.bg};
          border-radius: 50%;
          width: 4rem;
          height: 4rem;
          padding: 0.6rem;
          box-shadow: ${({ theme }) => theme.colors.shadowSupport};
        }

        p {
          font-size: 1.4rem;
          padding-top: 0.4rem;
        }
      }
    }

    .product-data-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 1.6rem;

      span {
        font-weight: bold;
        margin-left: 0.5rem;
      }
    }

    hr {
      width: 90%;
      border: 0.05rem solid ${({ theme }) => theme.colors.border};
      margin: 1rem 0;
    }
  }

  .page_loading {
    font-size: 3.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
  }

  /* Enhanced Mobile Styles (only when .mobile-enhanced class is present) */
  &.mobile-enhanced {
    .container {
      padding: 3rem 1rem;
      max-width: 120rem;
      margin: 0 auto;
    }

    .grid-two-column {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      align-items: start;
    }

    .product-images {
      position: relative;
      top: auto;
      order: 1;
    }

    .product-data {
      order: 2;
      padding: 1.5rem;
      margin: 1rem;
      gap: 2rem;
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .product-header {
        h2 {
          font-size: 2.2rem;
          font-weight: 700;
          text-transform: capitalize;
          color: ${({ theme }) => theme.colors.text};
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .rating-section {
          margin-top: 1rem;
        }
      }

      .price-section {
        background: linear-gradient(135deg, #f8f9ff, #e8f2ff);
        padding: 1.5rem;
        border-radius: 1rem;
        border-left: 4px solid ${({ theme }) => theme.colors.helper};

        .original-price {
          font-size: 1.4rem;
          color: #666;
          margin-bottom: 0.5rem;

          del {
            text-decoration: line-through;
            opacity: 0.7;
          }
        }

        .current-price {
          font-size: 2rem;
          font-weight: 700;
          color: ${({ theme }) => theme.colors.helper};
          margin-bottom: 1rem;
        }

        .savings-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 1.2rem;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
      }

      .description-section {
        .description {
          font-size: 1.4rem;
          line-height: 1.6;
          color: ${({ theme }) => theme.colors.text};
          background: ${({ theme }) => theme.colors.white};
          padding: 1.5rem;
          border-radius: 0.8rem;
          border-left: 3px solid ${({ theme }) => theme.colors.helper};
        }
      }

      .product-data-warranty {
        .warranty-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          background: ${({ theme }) => theme.colors.white};
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .product-warranty-data {
          text-align: center;
          padding: 1rem;
          border-radius: 0.8rem;
          transition: all 0.3s ease;

          &:hover {
            background: ${({ theme }) => theme.colors.helper}10;
            transform: translateY(-2px);
          }

          .warranty-icon {
            background: linear-gradient(135deg, ${({ theme }) => theme.colors.helper}, ${({ theme }) => theme.colors.btn});
            color: white;
            border-radius: 50%;
            width: 4rem;
            height: 4rem;
            padding: 0.8rem;
            margin-bottom: 1rem;
            box-shadow: 0 4px 15px ${({ theme }) => theme.colors.helper}30;
          }

          p {
            font-size: 1.2rem;
            font-weight: 600;
            color: ${({ theme }) => theme.colors.text};
            margin: 0;
          }
        }
      }

      .product-info-card {
        background: ${({ theme }) => theme.colors.white};
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

        .product-data-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;

                      .info-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 1rem 0;
            border-bottom: 1px solid ${({ theme }) => theme.colors.border};
            text-align: left;

            &:last-child {
              border-bottom: none;
            }

            .info-label, .info-value {
              font-size: 1.4rem;
            }

            .info-label {
              color: ${({ theme }) => theme.colors.text};
              font-weight: 500;
            }

            .info-value {
              font-weight: 600;
              
              &.in-stock {
                color: #10b981;
              }

              &.out-of-stock {
                color: #ef4444;
              }
            }
          }
        }
      }

      .add-to-cart-section {
        margin-top: 1rem;
      }

      .out-of-stock-message {
        background: linear-gradient(135deg, #fef2f2, #fee2e2);
        border: 1px solid #fecaca;
        border-radius: 1rem;
        padding: 2rem;
        text-align: center;

        p {
          color: #dc2626;
          font-size: 1.6rem;
          font-weight: 500;
          margin: 0;
        }
      }
    }
  }

  /* Small Mobile Styles (only for .mobile-enhanced) */
  /* Enhanced Mobile Styles (only when .mobile-enhanced class is present) */
&.mobile-enhanced {
  .container {
    padding: 2rem 1rem;
    max-width: 120rem;
    margin: 0 auto;
  }

  .grid-two-column {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: start;
  }

  .product-images {
    position: relative;
    top: auto;
    order: 1;
    padding: 1rem 0;
  }

  .product-data {
    order: 2;
    padding: 2rem;
    margin: 0 1rem;
    gap: 3rem;
    background: ${({ theme }) => theme.colors.bg};
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .product-header {
      h2 {
        font-size: 2.4rem;
        font-weight: 700;
        text-transform: capitalize;
        color: ${({ theme }) => theme.colors.text};
        line-height: 1.2;
        margin-bottom: 1.5rem;
      }

      .rating-section {
        margin-top: 1.5rem;
      }
    }

    .price-section {
      background: linear-gradient(135deg, #f8f9ff, #e8f2ff);
      padding: 2rem;
      border-radius: 1rem;
      border-left: 4px solid ${({ theme }) => theme.colors.helper};

      .original-price {
        font-size: 1.4rem;
        color: #666;
        margin-bottom: 1rem;

        del {
          text-decoration: line-through;
          opacity: 0.7;
        }
      }

      .current-price {
        font-size: 2.2rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.helper};
        margin-bottom: 1.5rem;
      }

      .savings-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0.8rem 1.2rem;
        border-radius: 2rem;
        font-size: 1.3rem;
        font-weight: 600;
        display: inline-block;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }
    }

    .description-section {
      .description {
        font-size: 1.5rem;
        line-height: 1.7;
        color: ${({ theme }) => theme.colors.text};
        background: ${({ theme }) => theme.colors.white};
        padding: 2rem;
        border-radius: 0.8rem;
        border-left: 3px solid ${({ theme }) => theme.colors.helper};
        margin-bottom: 1rem;
      }
    }

    .product-data-warranty {
      .warranty-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        background: ${({ theme }) => theme.colors.white};
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      .product-warranty-data {
        text-align: center;
        padding: 1.5rem;
        border-radius: 0.8rem;
        transition: all 0.3s ease;

        &:hover {
          background: ${({ theme }) => theme.colors.helper}10;
          transform: translateY(-2px);
        }

        .warranty-icon {
          background: linear-gradient(135deg, ${({ theme }) => theme.colors.helper}, ${({ theme }) => theme.colors.btn});
          color: white;
          border-radius: 50%;
          width: 4.5rem;
          height: 4.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px ${({ theme }) => theme.colors.helper}30;
        }

        p {
          font-size: 1.3rem;
          font-weight: 600;
          color: ${({ theme }) => theme.colors.text};
          margin: 0;
        }
      }
    }

    .product-info-card {
      background: ${({ theme }) => theme.colors.white};
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

      .product-data-info {
        display: flex;
        flex-direction: column;
        gap: 2rem;

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid ${({ theme }) => theme.colors.border};
          text-align: left;

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .info-label, .info-value {
            font-size: 1.5rem;
          }

          .info-label {
            color: ${({ theme }) => theme.colors.text};
            font-weight: 500;
          }

          .info-value {
            font-weight: 600;
            
            &.in-stock {
              color: #10b981;
            }

            &.out-of-stock {
              color: #ef4444;
            }
          }
        }
      }
    }

    .add-to-cart-section {
      margin-top: 2rem;
    }

    .out-of-stock-message {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 1px solid #fecaca;
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      margin-top: 2rem;

      p {
        color: #dc2626;
        font-size: 1.6rem;
        font-weight: 500;
        margin: 0;
      }
    }
  }
}

/* Enhanced Mobile Styles (only when .mobile-enhanced class is present) */
&.mobile-enhanced {
  .container {
    padding: 3rem 1.5rem;
    max-width: 120rem;
    margin: 0 auto;
  }

  .grid-two-column {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    align-items: start;
  }

  .product-images {
    position: relative;
    top: auto;
    order: 1;
    padding: 2rem 0;
  }

  .product-data {
    order: 2;
    padding: 3rem 2.5rem;
    margin: 0 1rem 2rem;
    gap: 4rem;
    background: ${({ theme }) => theme.colors.bg};
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .product-header {
      h2 {
        font-size: 2.4rem;
        font-weight: 700;
        text-transform: capitalize;
        color: ${({ theme }) => theme.colors.text};
        line-height: 1.3;
        margin-bottom: 2rem;
      }

      .rating-section {
        margin-top: 2rem;
      }
    }

    .price-section {
      background: linear-gradient(135deg, #f8f9ff, #e8f2ff);
      padding: 3rem 2.5rem;
      border-radius: 1rem;
      border-left: 4px solid ${({ theme }) => theme.colors.helper};

      .original-price {
        font-size: 1.5rem;
        color: #666;
        margin-bottom: 1.5rem;

        del {
          text-decoration: line-through;
          opacity: 0.7;
        }
      }

      .current-price {
        font-size: 2.4rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.helper};
        margin-bottom: 2rem;
      }

      .savings-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 2rem;
        font-size: 1.4rem;
        font-weight: 600;
        display: inline-block;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }
    }

    .description-section {
      .description {
        font-size: 1.6rem;
        line-height: 1.8;
        color: ${({ theme }) => theme.colors.text};
        background: ${({ theme }) => theme.colors.white};
        padding: 3rem 2.5rem;
        border-radius: 0.8rem;
        border-left: 3px solid ${({ theme }) => theme.colors.helper};
      }
    }

    .product-data-warranty {
      .warranty-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 3rem;
        background: ${({ theme }) => theme.colors.white};
        padding: 3rem 2.5rem;
        border-radius: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      .product-warranty-data {
        text-align: center;
        padding: 2rem 1rem;
        border-radius: 0.8rem;
        transition: all 0.3s ease;

        &:hover {
          background: ${({ theme }) => theme.colors.helper}10;
          transform: translateY(-2px);
        }

        .warranty-icon {
          background: linear-gradient(135deg, ${({ theme }) => theme.colors.helper}, ${({ theme }) => theme.colors.btn});
          color: white;
          border-radius: 50%;
          width: 5rem;
          height: 5rem;
          padding: 1.2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px ${({ theme }) => theme.colors.helper}30;
        }

        p {
          font-size: 1.4rem;
          font-weight: 600;
          color: ${({ theme }) => theme.colors.text};
          margin: 0;
          line-height: 1.4;
        }
      }
    }

    .product-info-card {
      background: ${({ theme }) => theme.colors.white};
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

      .product-data-info {
        display: flex;
        flex-direction: column;
        gap: 3rem;

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 2rem 0;
          border-bottom: 1px solid ${({ theme }) => theme.colors.border};
          text-align: left;

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .info-label, .info-value {
            font-size: 1.6rem;
          }

          .info-label {
            color: ${({ theme }) => theme.colors.text};
            font-weight: 500;
          }

          .info-value {
            font-weight: 600;
            
            &.in-stock {
              color: #10b981;
            }

            &.out-of-stock {
              color: #ef4444;
            }
          }
        }
      }
    }

    .add-to-cart-section {
      margin-top: 3rem;
    }

    .out-of-stock-message {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 1px solid #fecaca;
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      text-align: center;
      margin-top: 3rem;

      p {
        color: #dc2626;
        font-size: 1.7rem;
        font-weight: 500;
        margin: 0;
      }
    }
  }
}

/* Small Mobile Styles (only for .mobile-enhanced) */
&.mobile-enhanced {
  @media (max-width: 480px) {
    .container {
      padding: 2rem 1rem;
    }

    .grid-two-column {
      gap: 3rem;
    }

    .product-data {
      margin: 0 0.5rem 1.5rem;
      padding: 2.5rem 2rem;
      gap: 3rem;

      .product-header {
        h2 {
          font-size: 2.2rem;
          margin-bottom: 1.5rem;
        }

        .rating-section {
          margin-top: 1.5rem;
        }
      }

      .price-section {
        padding: 2.5rem 2rem;

        .original-price {
          margin-bottom: 1.2rem;
        }

        .current-price {
          font-size: 2.1rem;
          margin-bottom: 1.5rem;
        }

        .savings-badge {
          padding: 0.8rem 1.2rem;
          font-size: 1.3rem;
        }
      }

      .description-section .description {
        font-size: 1.5rem;
        padding: 2.5rem 2rem;
      }

      .product-data-warranty {
        .warranty-grid {
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding: 2.5rem 2rem;
        }

        .product-warranty-data {
          display: flex;
          align-items: center;
          text-align: left;
          gap: 2rem;
          padding: 2rem 1.5rem;

          .warranty-icon {
            width: 4.5rem;
            height: 4.5rem;
            flex-shrink: 0;
            margin-bottom: 0;
          }

          p {
            font-size: 1.4rem;
            margin: 0;
          }
        }
      }

      .product-info-card {
        padding: 2.5rem 2rem;

        .product-data-info {
          gap: 2.5rem;

          .info-item {
            padding: 1.5rem 0;
            gap: 0.8rem;
          }
        }
      }

      .add-to-cart-section {
        margin-top: 2.5rem;
      }
    }
  }

  @media (max-width: 360px) {
    .container {
      padding: 1.5rem 0.8rem;
    }

    .grid-two-column {
      gap: 2.5rem;
    }

    .product-data {
      margin: 0 0.25rem 1rem;
      padding: 2rem 1.5rem;
      gap: 2.5rem;

      .product-header h2 {
        font-size: 2rem;
      }

      .price-section {
        padding: 2rem 1.5rem;

        .current-price {
          font-size: 1.9rem;
        }

        .savings-badge {
          font-size: 1.2rem;
          padding: 0.7rem 1rem;
        }
      }

      .description-section .description {
        font-size: 1.4rem;
        padding: 2rem 1.5rem;
      }

      .product-data-warranty .warranty-grid {
        padding: 2rem 1.5rem;
        gap: 2rem;

        .product-warranty-data {
          padding: 1.5rem 1rem;
          gap: 1.5rem;

          .warranty-icon {
            width: 4rem;
            height: 4rem;
          }
        }
      }

      .product-info-card {
        padding: 2rem 1.5rem;

        .product-data-info {
          gap: 2rem;

          .info-item {
            padding: 1.2rem 0;
          }
        }
      }
    }
  }
}`;

export default SingleProduct;