import React from "react";

const Badge = ({ children, priority = "none", className = "", ...props }) => {
  const priorityColors = {
    none: "bg-gray-400 text-white",
    low: "bg-green-200 text-green-800",
    medium: "bg-yellow-200 text-yellow-800",
    high: "bg-red-200 text-red-800",
  };

  const colorClass = priorityColors[priority] || priorityColors.none;

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

