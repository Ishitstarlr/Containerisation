import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    user: auth0User, 
    isLoading,
    loginWithRedirect, 
    logout,
    getAccessTokenSilently 
  } = useAuth0();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem('auth0_token', token);

          console.log(auth0User);
          const userData = await authAPI.register(auth0User);
          console.log(userData)
          
          // Set default role as ORGANIZER for testing
          const userWithRole = {
            ...userData,
            role: userData.role || 'ORGANIZER', // Default to ORGANIZER if no role
            isProfileComplete: !!(userData?.profile?.firstName && 
              userData?.profile?.lastName && 
              userData?.profile?.bio && 
              userData?.profile?.phone)
          };
          
          setUser(userWithRole);
        } catch (error) {
          console.error('Error initializing auth:', error);
        }
      }
    };

    initAuth();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login: loginWithRedirect,
    logout: () => {
      localStorage.removeItem('auth0_token');
      logout({ returnTo: window.location.origin });
    },
    getAccessToken: getAccessTokenSilently
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
