const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      let { id, color, amount, product } = action.payload;

      // Check if the exact item already exists in cart (same id and color)
      let existingProductIndex = state.cart.findIndex(
        (curItem) => curItem.id === id && curItem.color === color
      );

      if (existingProductIndex >= 0) {
        // Item exists, update quantity
        let updatedCart = state.cart.map((item, index) => {
          if (index === existingProductIndex) {
            return { ...item, amount: item.amount + amount };
          }
          return item;
        });

        return {
          ...state,
          cart: updatedCart,
        };
      } else {
        // New item, add to cart
        let cartProduct = {
          id: id,
          name: product.name,
          color,
          amount,
          image: product.image[0].url,
          price: product.price,
          max: product.stock,
        };

        return {
          ...state,
          cart: [...state.cart, cartProduct],
        };
      }

    case "REMOVE_ITEM":
      // Remove item by cartItemId (which is the database ID)
      let updatedCart = state.cart.filter((item) => item.cartItemId !== action.payload);
      return {
        ...state,
        cart: updatedCart,
      };

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      };

    case "SET_DECREASE":
      let updatedCartDecrease = state.cart.map((item) => {
        if (item.cartItemId === action.payload) { // Use cartItemId instead of id
          let decAmount = item.amount - 1;
          if (decAmount <= 0) {
            decAmount = 1; // Don't allow quantity to go below 1
          }
          return {
            ...item,
            amount: decAmount,
          };
        }
        return item;
      });
      return {
        ...state,
        cart: updatedCartDecrease,
      };

    case "SET_INCREASE":
      let updatedCartIncrease = state.cart.map((item) => {
        if (item.cartItemId === action.payload) { // Use cartItemId instead of id
          let incAmount = item.amount + 1;
          if (incAmount >= item.max) {
            incAmount = item.max;
          }
          return {
            ...item,
            amount: incAmount,
          };
        }
        return item;
      });
      return {
        ...state,
        cart: updatedCartIncrease,
      };

    // Load cart from backend
    case "LOAD_CART_FROM_BACKEND":
      return {
        ...state,
        cart: action.payload,
      };

    // Set loading state
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "CART_ITEM_PRICE_TOTAL":
      let { total_items, total_amount } = state.cart.reduce(
        (accum, curElem) => {
          let { price, amount } = curElem;

          accum.total_items += amount;
          accum.total_amount += price * amount;

          return accum;
        },
        {
          total_items: 0,
          total_amount: 0,
        }
      );
      return {
        ...state,
        total_items,
        total_amount,
      };

    default:
      return state;
  }
};

export default cartReducer;