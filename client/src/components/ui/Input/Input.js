import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
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

  // Resolve left icon reliably (replaces any legacy FontAwesome <i> tags with clean SVG SearchIcon)
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    if (
      (React.isValidElement(leftIcon) &&
        typeof leftIcon.props?.className === 'string' &&
        leftIcon.props.className.includes('fa-')) ||
      leftIcon === 'search'
    ) {
      return <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />;
    }
    return leftIcon;
  };

  const resolvedLeftIcon = renderLeftIcon();

  return (
    <div className="form-group">
      <div className={`input-wrapper ${error ? "error" : ""}`}>
        
        {/* Left Icon */}
        {resolvedLeftIcon && <span className="icon left">{resolvedLeftIcon}</span>}

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