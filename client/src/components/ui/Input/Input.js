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
  enterKeyHint,
  onKeyDown,
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      // Dismiss mobile software keyboard on "->" (Enter / Search / Go)
      e.currentTarget.blur();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const isSearch =
    type === 'search' ||
    (typeof props.placeholder === 'string' &&
      props.placeholder.toLowerCase().includes('search'));

  const resolvedEnterKeyHint =
    enterKeyHint || (isSearch ? 'search' : 'done');

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
          onKeyDown={handleKeyDown}
          enterKeyHint={resolvedEnterKeyHint}
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
          rightIcon && <span className="icon right clickable">{rightIcon}</span>
        )}
      </div>

      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;