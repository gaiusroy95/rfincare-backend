import React, { useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const HeaderNavDropdown = ({
  label,
  children = [],
  isOpen,
  onToggle,
  onClose,
  onNavigate,
  isActive,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className={`rf-nav-link ${isActive ? 'rf-nav-link-active' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{label}</span>
        <Icon name="ChevronDown" size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="rf-nav-dropdown animate-fade-in">
          {children.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className="rf-nav-dropdown-item"
            >
              {item.icon ? <Icon name={item.icon} size={16} className="text-[var(--color-brand-green)] shrink-0" /> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderNavDropdown;
