import React, { useState, useRef, forwardRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Skeleton from "../Skeleton/Skeleton";
import "../Form.css";

export const InputSkeleton = ({ label, className = '', fullWidth = false }) => (
  <div
    className={`form-group form-group--skeleton ${className}`.trim()}
    style={{ width: fullWidth ? '100%' : undefined }}
  >
    {label && (
      <div style={{ marginBottom: '6px' }}>
        <Skeleton variant="text" width={80} height={15} />
      </div>
    )}
    <div
      className="form-input-wrapper form-input-wrapper--skeleton"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: '42px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
      }}
    >
      <Skeleton variant="text" width="60%" height={18} />
    </div>
  </div>
);

const Input = forwardRef(({
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
  onPointerDown,
  onMouseDown,
  onTouchStart,
  onClick,
  onBlur,
  className = "",
  loading = false,
  ...props
}, forwardedRef) => {
  const [showPassword, setShowPassword] = useState(false);

  const internalRef = useRef(null);
  const inputRef = internalRef;
  const wasFocusedRef = useRef(false);
  const lastInteractionRef = useRef(0);

  if (loading) {
    return <InputSkeleton label={label} className={className} />;
  }

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

  const setRef = (node) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };


  const isSearch =
    type === 'search' ||
    enterKeyHint === 'search' ||
    (typeof props.placeholder === 'string' &&
      (props.placeholder.toLowerCase().includes('search') ||
        props.placeholder.toLowerCase().includes('filter')));

  const resolvedEnterKeyHint =
    enterKeyHint || (isSearch ? 'search' : 'done');

  const handleInteractionStart = (e) => {
    const now = Date.now();
    if (now - lastInteractionRef.current > 150) {
      wasFocusedRef.current = document.activeElement === e.currentTarget;
      lastInteractionRef.current = now;
    }
    if (e.type === 'pointerdown' && onPointerDown) onPointerDown(e);
    if (e.type === 'mousedown' && onMouseDown) onMouseDown(e);
    if (e.type === 'touchstart' && onTouchStart) onTouchStart(e);
  };

  const handleClick = (e) => {
    const hasSelection =
      typeof window !== 'undefined' &&
      window.getSelection &&
      window.getSelection().toString().length > 0;

    // Toggle close (blur): If input was already focused when interaction started, clicking it again blurs/closes
    if (wasFocusedRef.current && !hasSelection) {
      e.currentTarget.blur();
      wasFocusedRef.current = false;
      lastInteractionRef.current = 0;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }, 0);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleBlur = (e) => {
    wasFocusedRef.current = false;
    lastInteractionRef.current = 0;
    if (onBlur) {
      onBlur(e);
    }
  };

    const hasLeftIcon = Boolean(resolvedLeftIcon);
    const hasRightIcon = Boolean(rightIcon || isPasswordToggle);

    return (
      <div className={`form-group ${className}`.trim()}>
        <div
          className={`input-wrapper ${error ? "error" : ""} ${
            hasLeftIcon ? "has-left-icon" : ""
          } ${hasRightIcon ? "has-right-icon" : ""}`.trim()}
        >
        
        {/* Left Icon */}
        {resolvedLeftIcon && <span className="icon left">{resolvedLeftIcon}</span>}

        <input
          ref={setRef}
          type={inputType}
          className="input"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onPointerDown={handleInteractionStart}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onClick={handleClick}
          onBlur={handleBlur}
          enterKeyHint={resolvedEnterKeyHint}
          placeholder=" "
          {...props}
        />

        {Boolean(label) && <label className="floating-label">{label}</label>}

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
});

Input.displayName = "Input";
Input.Skeleton = InputSkeleton;

export default Input;