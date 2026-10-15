import React from 'react';
import './Skeleton.css';

/**
 * Universal Skeleton Loader Component
 *
 * @param {'text'|'circular'|'rounded'|'rectangular'} [variant='text'] - Shape of skeleton
 * @param {string|number} [width] - Width of skeleton (number is interpreted as px)
 * @param {string|number} [height] - Height of skeleton (number is interpreted as px)
 * @param {'wave'|'pulse'|'none'} [animation='wave'] - Animation type
 * @param {string} [className=''] - Additional class names
 * @param {React.CSSProperties} [style] - Inline styles
 * @param {React.ReactNode} [children] - Optional children for wrapper skeletons
 */
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  animation = 'wave',
  className = '',
  style = {},
  children,
  ...rest
}) => {
  const inlineStyles = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...style,
  };

  const classNames = [
    'ui-skeleton',
    `ui-skeleton--${variant}`,
    animation !== 'none' ? `ui-skeleton--${animation}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} style={inlineStyles} {...rest}>
      {children}
    </span>
  );
};

export default Skeleton;
