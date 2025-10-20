import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AppProvider } from "./context/productcontex";
import { FilterContextProvider } from "./context/filter_context";
import { CartProvider } from "./context/cart_context";
import { Auth0Provider } from '@auth0/auth0-react';
import { OrdersProvider } from "./context/orders_context";
import { ColdStartProvider } from "./context/coldstart_context"; // ✅ Import ColdStartProvider

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Auth0Provider
    domain="dev-d5cfr3porxpc0rfq.us.auth0.com"
    clientId="r0GXd4IsrwM8CfgpfEt4OSEyh44TdoWy"
    redirectUri={window.location.origin}
  >
    <AppProvider>
      <FilterContextProvider>
        <CartProvider>
          <OrdersProvider>
            <ColdStartProvider> {/* ✅ Add ColdStartProvider here */}
              <App />
            </ColdStartProvider>
          </OrdersProvider>
        </CartProvider>
      </FilterContextProvider>
    </AppProvider>
  </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();