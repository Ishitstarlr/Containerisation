import React, { useState, useEffect } from 'react';
import {useNavigate, Link, Navigate} from 'react-router-dom';
import { authAPI } from '../api/api.js';
import Button from '../components/Button';
import { useAuth0 } from "@auth0/auth0-react";

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARTICIPANT');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const [email, setEmail] = useState(user.email);
  // const { register } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
  }, [isAuthenticated, navigate]);

  //If user is not logged in using auth0, restrict the user to access the page
  // if(!isAuthenticated){
  //   return <Navigate to={'/'} replace/>;
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register({email, username, role});
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-black transition-colors text-sm";
  const labelClasses = "block mb-2 text-sm text-gray-600 tracking-wide";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <button
          onClick={() => loginWithRedirect({ screen_hint: 'signup' })}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Sign up with Auth0
        </button>
      </div>
    </div>
  );
};

export default Register;

