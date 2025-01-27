import React from "react";

const Button = ({ children, className = "", ...props }) => {
  const baseStyles =
    "px-4 py-2 rounded-xl font-medium focus:outline-none transition-all";

  return (
    <button
      className={`${baseStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
