import React from 'react';
import Skeleton from '../Skeleton/Skeleton';
import ActionButton from '../ActionButtons/ActionButton';
import './MobileCard.css';

export const MobileCardSkeleton = ({
  hasAvatar = true,
  metaCount = 3,
  count = 1,
  className = '',
}) => {
  const cards = Array.from({ length: count });

  return (
    <>
      {cards.map((_, idx) => (
        <article
          key={idx}
          className={`mobile-card mobile-card--skeleton ${className}`.trim()}
          role="status"
          aria-label="Loading card"
        >
          <div className="mobile-card__top">
            {hasAvatar && (
              <div className="mobile-card__avatar">
                <Skeleton variant="circular" width={42} height={42} />
              </div>
            )}
            <div className="mobile-card__main" style={{ width: '100%' }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </div>
            <div className="mobile-card__right">
              <Skeleton
                variant="rounded"
                width={50}
                height={20}
                style={{ borderRadius: '6px' }}
              />
            </div>
          </div>

          <div className="mobile-card__meta">
            {Array.from({ length: metaCount }).map((_, mIdx) => (
              <div className="mobile-card__meta-item" key={mIdx}>
                <Skeleton variant="text" width={45} height={14} />
                <Skeleton variant="text" width={65} height={18} />
              </div>
            ))}
          </div>
        </article>
      ))}
    </>
  );
};

const MobileCard = ({
  avatar,
  title,
  subtitle,
  rightContent,
  meta = [],
  actions = [],
  actionsPlacement = 'bottom',
  loading = false,
  onClick,
}) => {
  if (loading) {
    return (
      <MobileCardSkeleton
        hasAvatar={Boolean(avatar)}
        metaCount={meta.length || 3}
      />
    );
  }
    return (
        <article
            className={`mobile-card ${actionsPlacement === 'top-right' ? 'mobile-card--actions-top' : ''} ${onClick ? 'mobile-card--clickable' : ''}`}
            onClick={onClick}
        >
            <div className="mobile-card__top">

                {avatar && (
                    <div className="mobile-card__avatar">
                        {avatar}
                    </div>
                )}

                <div className="mobile-card__main">
                    <strong>{title}</strong>
                    {subtitle && (typeof subtitle === 'string' ? <span>{subtitle}</span> : subtitle)}
                </div>

                {rightContent && (
                    <div className="mobile-card__right">
                        {rightContent}
                    </div>
                )}

                {actionsPlacement === 'top-right' && actions.length > 0 && (
                    <div className="mobile-card__top-actions">
                        {actions.map((action, idx) => {
                            const actionType =
                                action.type ||
                                (action.className?.includes('danger') ? 'delete' :
                                 action.className?.includes('edit') ? 'edit' :
                                 action.className?.includes('view') ? 'view' : 'default');

                            return (
                                <ActionButton
                                    key={action.key || action.label || idx}
                                    type={actionType}
                                    icon={action.icon}
                                    tooltip={action.label || action.tooltip}
                                    onClick={action.onClick}
                                    className={action.className}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {meta.length > 0 && (
                <div className="mobile-card__meta">
                    {meta.map((item) => (
                        <div className="mobile-card__meta-item" key={item.label}>
                            <span>{item.label}</span>
                            <strong className={item.className || ''}>
                                {item.value}
                            </strong>
                        </div>
                    ))}
                </div>
            )}

            {actionsPlacement !== 'top-right' && actions.length > 0 && (
                <div className="mobile-card__actions">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className={action.className || ''}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </article>
    );
};

MobileCard.Skeleton = MobileCardSkeleton;

export default MobileCard;


