import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary', 
  to, 
  onClick,
  className = '' 
}) => {
  const baseStyles = "px-6 py-2.5 rounded-full text-sm transition-all duration-300 font-medium tracking-wide hover:opacity-75";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-900",
    secondary: "border border-black text-black hover:bg-black hover:text-white",
    text: "text-gray-600 hover:text-black"
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (to) {
    return <Link to={to} className={classes}>{children}</Link>;
  }

  return <button onClick={onClick} className={classes}>{children}</button>;
};

export default Button; 