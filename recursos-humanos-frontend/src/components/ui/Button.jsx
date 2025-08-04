import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  type = 'button',
  onClick 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500",
    success: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-500",
    info: "text-white bg-sky-500 hover:bg-sky-600 focus:ring-sky-500",
    light: "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500",
    dark: "text-white bg-gray-800 hover:bg-gray-900 focus:ring-gray-500",
    outline: "text-blue-600 bg-transparent border border-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };
  
  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-base",
  };
  
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  const widthStyle = fullWidth ? "w-full" : "";
  
  const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${disabledStyle}`;
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
