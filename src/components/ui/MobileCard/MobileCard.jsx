import './MobileCard.css'

const MobileCard = ({
    avatar,
    title,
    subtitle,
    rightContent,
    meta = [],
    actions = [],
}) => {
    return (
        <article className="mobile-card">
            <div className="mobile-card__top">

                {avatar && (
                    <div className="mobile-card__avatar">
                        {avatar}
                    </div>
                )}

                <div className="mobile-card__main">
                    <strong>{title}</strong>
                    {subtitle && <span>{subtitle}</span>}
                </div>



                {rightContent && (
                    <div className="mobile-card__right">
                        {rightContent}
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

            {actions.length > 0 && (
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

export default MobileCard;
