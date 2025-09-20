import { useEffect } from "react";
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
  }, [id]); // ✅ added dependency

  if (isSingleLoading) {
    return <div className="page_loading">Loading.....</div>;
  }

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
};

const Wrapper = styled.section`
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

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 0 2.4rem;

    .product-data {
      h2 {
        font-size: 2.2rem;
      }
    }
  }
`;

export default SingleProduct;
