import React from "react";
import '../Form.css'

const Button = ({ value, ...props }) => {
  return (
    <button className="btn-primary" {...props}>
      {value}
    </button>
  );
};

export default Button;