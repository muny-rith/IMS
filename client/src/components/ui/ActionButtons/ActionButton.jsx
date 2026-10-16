import React from 'react';
import { Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './ActionButtons.css';

const DEFAULT_CONFIG = {
  view: {
    label: 'View',
    icon: <VisibilityIcon />,
    className: 'ui-action-btn--view',
  },
  edit: {
    label: 'Edit',
    icon: <EditIcon />,
    className: 'ui-action-btn--edit',
  },
  delete: {
    label: 'Delete',
    icon: <DeleteIcon />,
    className: 'ui-action-btn--delete',
  },
  danger: {
    label: 'Delete',
    icon: <DeleteIcon />,
    className: 'ui-action-btn--danger',
  },
  default: {
    label: 'Action',
    icon: null,
    className: 'ui-action-btn--default',
  },
};

const ActionButton = ({
  type = 'default',
  icon,
  tooltip,
  title,
  ariaLabel,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
  stopClickPropagation = true,
  ...props
}) => {
  const config = DEFAULT_CONFIG[type] || DEFAULT_CONFIG.default;
  const resolvedIcon = icon || config.icon;
  const resolvedLabel = tooltip || title || ariaLabel || config.label;
  const resolvedTypeClass = config.className;
  const sizeClass = size === 'sm' ? 'ui-action-btn--sm' : '';

  const handleClick = (e) => {
    if (stopClickPropagation) {
      e.stopPropagation();
    }
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const buttonElement = (
    <button
      type="button"
      className={`ui-action-btn ${resolvedTypeClass} ${sizeClass} ${className}`.trim()}
      onClick={handleClick}
      disabled={disabled}
      aria-label={resolvedLabel}
      title={!resolvedLabel ? undefined : resolvedLabel}
      {...props}
    >
      {resolvedIcon}
    </button>
  );

  if (resolvedLabel) {
    return (
      <Tooltip title={resolvedLabel} arrow placement="top" enterDelay={400} leaveDelay={100}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default ActionButton;
