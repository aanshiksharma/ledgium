import React from "react";

function Button({ children, onClick, className, type }) {
  return (
    <button
      type={type ? type : "button"}
      onClick={onClick}
      className={`
        flex items-center
        rounded-lg
        transition-all ease-out duration-200
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
