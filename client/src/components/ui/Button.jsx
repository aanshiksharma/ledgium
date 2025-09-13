import React from "react";

function Button({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center
        w-full rounded-lg
        transition ease-out duration-200
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
