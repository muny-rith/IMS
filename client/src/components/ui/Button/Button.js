import React from 'react';
import './Button.css';
import '../Form.css';

/**
 * Unified Button Component (components/ui/Button)
 *
 * @param {React.ReactNode} [children] - Button content or text
 * @param {string} [value] - Text label (backward compatible with existing pages)
 * @param {'primary'|'secondary'|'outline'|'text'|'ghost'|'danger'|'danger-outline'|'success'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {React.ReactNode} [icon] - Leading icon (rendered before label)
 * @param {React.ReactNode} [startIcon] - Alias for icon
 * @param {React.ReactNode} [endIcon] - Trailing icon (rendered after label)
 * @param {boolean} [loading=false] - Shows loading spinner
 * @param {boolean} [fullWidth=false] - Makes button 100% width
 * @param {boolean} [disabled=false] - Disables the button
 * @param {boolean} [responsiveCollapse=false] - Collapses text on mobile (<=576px) if an icon is present
 * @param {string} [type='button'] - Button type attribute
 * @param {string} [className=''] - Additional custom CSS classes
 */
const Button = ({
  children,
  value,
  variant = 'primary',
  size = 'md',
  icon,
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  disabled = false,
  responsiveCollapse = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const content = children !== undefined ? children : value;
  const leadingIcon = startIcon || icon;
  const hasIcon = Boolean(leadingIcon || endIcon);
  const shouldCollapse = responsiveCollapse && hasIcon;

  // Normalize aliases: secondary -> outline, ghost -> text
  const normalizedVariant =
    variant === 'secondary'
      ? 'outline'
      : variant === 'ghost'
      ? 'text'
      : variant;

  const classNames = [
    'ui-btn',
    `ui-btn--${normalizedVariant}`,
    `ui-btn--${size}`,
    normalizedVariant === 'primary' ? 'btn-primary' : '',
    fullWidth ? 'ui-btn--full-width' : '',
    loading ? 'ui-btn--loading' : '',
    shouldCollapse ? 'ui-btn--responsive-collapse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Maintain accessibility and tooltip when label collapses on mobile
  const fallbackText = typeof content === 'string' ? content : undefined;
  const resolvedTitle = props.title || (shouldCollapse ? fallbackText : undefined);
  const resolvedAriaLabel = props['aria-label'] || (shouldCollapse ? fallbackText : undefined);

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      title={resolvedTitle}
      aria-label={resolvedAriaLabel}
      {...props}
    >
      {loading && <span className="ui-btn__spinner" aria-hidden="true" />}
      {!loading && leadingIcon && (
        <span className="ui-btn__icon ui-btn__icon--start">{leadingIcon}</span>
      )}
      {content !== undefined && content !== null && (
        <span className="ui-btn__label">{content}</span>
      )}
      {!loading && endIcon && (
        <span className="ui-btn__icon ui-btn__icon--end">{endIcon}</span>
      )}
    </button>
  );
};

export default Button;