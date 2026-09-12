import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Create a Context for navigation events
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [onNavigateAway, setOnNavigateAway] = useState(null); // Store callback

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      console.log(`Navigating away from: ${prevPathRef.current} to ${location.pathname}`);

      // Execute the registered function (if any)
      if (typeof onNavigateAway === "function") {
        onNavigateAway();
      } else {
        console.log("onNavigateAway is not a function");
      }

      prevPathRef.current = location.pathname; // Update previous path
    }
  }, [location.pathname, onNavigateAway]);

  return (
    <NavigationContext.Provider value={{ setOnNavigateAway }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to allow components to register a function that runs before navigating away
export const useNavigationAway = () => {
  return useContext(NavigationContext);
};
