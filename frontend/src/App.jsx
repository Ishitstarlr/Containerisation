import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import CreateEvent from './components/CreateEvent';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import EditEvent from './components/EditEvent';
import ApplyForm from "./pages/ApplyForEvent";  // Import the component
import { NavigationProvider } from './contexts/NavigationContext';
import OrganiserDashboard from './pages/OrganiserDashboard.jsx';
import EventDashboard from './pages/EventDashboard.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Debug log
  console.log('User role:', user?.role, 'Required role:', requiredRole);
  
  if (requiredRole && (!user || user.role !== requiredRole)) {
    console.log('Role mismatch, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <NavigationProvider>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: import.meta.env.VITE_AUTH0_SCOPE
        }}
        cacheLocation="localstorage"
      >
        <AuthProvider>
          <div className="App min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events" element={<Events />} />
                <Route 
                  path="/create-event" 
                  element={
                    <ProtectedRoute requiredRole="ORGANIZER">
                      <CreateEvent />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route 
                  path="/edit-event/:id" 
                  element={
                    <ProtectedRoute requiredRole="ORGANIZER">
                      <EditEvent />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-profile" 
                  element={
                    <ProtectedRoute>
                      <Profile initialEditMode={true} />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/events/:id/apply" element={<ApplyForm />} />  {/* NEW ROUTE */}
                <Route path="/org-dashboard" element={<OrganiserDashboard />} />
                <Route path="/event-dashboard/:id" element={<EventDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Auth0Provider>
      </NavigationProvider>
    </Router>
  );
};

export default App;
