import React, { useEffect } from 'react';
import FeatureProduct from "./components/FeatureProduct";
import HeroSection from "./components/HeroSection";
import Services from "./components/Services";
import Trusted from "./components/Trusted";
import Marquee from "./components/Marquee";
import ColdStartLoader from "./components/ColdStartLoader";
import { useColdStart } from "./context/coldstart_context";

const Home = () => {
  const { isWarmingUp, wakeUpBackend } = useColdStart();
  
  const data = {
    name: "stop&shop store",
  };

  // Wake up backend when home page loads
  useEffect(() => {
    wakeUpBackend();
  }, [wakeUpBackend]);
  
  return (
    <>
      {/* Cold Start Loader */}
      <ColdStartLoader isWarmingUp={isWarmingUp} />
      
      {/* Marquee */}
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