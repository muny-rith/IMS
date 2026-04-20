import React, { useState } from "react";
import "../Form.css";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  leftIcon,
  rightIcon,
  isPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    isPasswordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div className="form-group">
      <div className={`input-wrapper ${error ? "error" : ""}`}>
        
        {/* Left Icon */}
        {leftIcon && <span className="icon left">{leftIcon}</span>}

        <input
          type={inputType}
          className="input"
          value={value}
          onChange={onChange}
          placeholder=" "
          {...props}
        />

        <label className="floating-label">{label}</label>

        {/* Right Icon OR Password Toggle */}
        {isPasswordToggle ? (
          <span
            className="icon right clickable"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        ) : (
          rightIcon && <span className="icon right">{rightIcon}</span>
        )}
      </div>

      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;