import React from 'react';
import FeatureProduct from "./components/FeatureProduct";
import HeroSection from "./components/HeroSection";
import Services from "./components/Services";
import Trusted from "./components/Trusted";
import Marquee from "./components/Marquee"; // ✅ Import the new Marquee component

const Home = () => {
  const data = {
    name: "stop&shop store",
  };
  
  return (
    <>
      {/* ✅ Add Marquee right after navbar */}
      <Marquee />
      
      {/* Existing home page components */}
      <HeroSection myData={data} />
      <FeatureProduct />
      <Services />
      <Trusted />
    </>
  );
};

export default Home;