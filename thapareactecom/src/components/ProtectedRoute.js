// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // if no token, redirect to 404 page
  if (!token) {
    return <Navigate to="*" replace />;
  }

  return children;
};

export default ProtectedRoute;
