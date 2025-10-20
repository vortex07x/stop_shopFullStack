import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ColdStartContext = createContext();

const BACKEND_URL = "https://stopshop-backend.onrender.com";
const COLD_START_KEY = "backend_last_active";
const COLD_START_THRESHOLD = 15 * 60 * 1000; // 15 minutes

const ColdStartProvider = ({ children }) => {
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [warmupComplete, setWarmupComplete] = useState(false);

  // Check if backend might be cold
  const checkIfCold = useCallback(() => {
    const lastActive = localStorage.getItem(COLD_START_KEY);
    if (!lastActive) return true;
    
    const timeSinceActive = Date.now() - parseInt(lastActive);
    return timeSinceActive > COLD_START_THRESHOLD;
  }, []);

  // Ping backend to wake it up
  const wakeUpBackend = useCallback(async () => {
    if (warmupComplete) return;
    
    const isCold = checkIfCold();
    if (!isCold) {
      setWarmupComplete(true);
      return;
    }

    console.log("🔥 Backend might be cold, waking up...");
    setIsWarmingUp(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout

      const response = await fetch(`${BACKEND_URL}/api/auth/health`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        console.log("✅ Backend is awake!");
        localStorage.setItem(COLD_START_KEY, Date.now().toString());
        setWarmupComplete(true);
      } else {
        console.log("⚠️ Backend warmup completed with issues");
        setWarmupComplete(true);
      }
    } catch (error) {
      console.log("⚠️ Backend warmup timeout or error:", error.message);
      setWarmupComplete(true);
    } finally {
      setIsWarmingUp(false);
    }
  }, [checkIfCold, warmupComplete]);

  // Mark backend as active after successful API calls
  const markBackendActive = useCallback(() => {
    localStorage.setItem(COLD_START_KEY, Date.now().toString());
    if (!warmupComplete) {
      setWarmupComplete(true);
    }
  }, [warmupComplete]);

  // Reset warmup state (useful for testing or manual refresh)
  const resetWarmup = useCallback(() => {
    localStorage.removeItem(COLD_START_KEY);
    setWarmupComplete(false);
    setIsWarmingUp(false);
  }, []);

  return (
    <ColdStartContext.Provider
      value={{
        isWarmingUp,
        warmupComplete,
        wakeUpBackend,
        markBackendActive,
        resetWarmup,
      }}
    >
      {children}
    </ColdStartContext.Provider>
  );
};

const useColdStart = () => {
  const context = useContext(ColdStartContext);
  if (!context) {
    throw new Error("useColdStart must be used within ColdStartProvider");
  }
  return context;
};

export { ColdStartProvider, useColdStart };