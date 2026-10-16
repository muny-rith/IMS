import React from 'react';
import ActionButton from './ActionButton';
import Skeleton from '../Skeleton/Skeleton';
import './ActionButtons.css';

export const ActionGroupSkeleton = ({ count = 3, size = 'md', className = '' }) => {
  const dimension = size === 'sm' ? 30 : 34;

  return (
    <div className={`ui-action-group ui-action-group--skeleton ${className}`.trim()}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rounded"
          width={dimension}
          height={dimension}
          style={{ borderRadius: '9px' }}
        />
      ))}
    </div>
  );
};

const ActionGroup = ({
  onView,
  onEdit,
  onDelete,
  actions = [],
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  if (loading) {
    const totalCount =
      (onView ? 1 : 0) + (onEdit ? 1 : 0) + (onDelete ? 1 : 0) + actions.length || 3;
    return <ActionGroupSkeleton count={totalCount} size={size} className={className} />;
  }

  return (
    <div className={`ui-action-group ${className}`.trim()} {...props}>
      {onView && (
        <ActionButton
          type="view"
          size={size}
          onClick={onView}
        />
      )}

      {onEdit && (
        <ActionButton
          type="edit"
          size={size}
          onClick={onEdit}
        />
      )}

      {onDelete && (
        <ActionButton
          type="delete"
          size={size}
          onClick={onDelete}
        />
      )}

      {actions.map((act, idx) => (
        <ActionButton
          key={act.key || act.label || act.tooltip || idx}
          type={act.type || 'default'}
          icon={act.icon}
          tooltip={act.tooltip || act.label}
          onClick={act.onClick}
          disabled={act.disabled}
          size={act.size || size}
          className={act.className}
        />
      ))}
    </div>
  );
};

ActionGroup.Skeleton = ActionGroupSkeleton;

export default ActionGroup;
