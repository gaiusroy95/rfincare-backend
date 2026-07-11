import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 220 });

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minWidth = Math.max(220, rect.width);
    let left = rect.left;
    const maxLeft = window.innerWidth - minWidth - 12;
    if (left > maxLeft) left = Math.max(12, maxLeft);
    setCoords({
      top: rect.bottom + 6,
      left,
      minWidth,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClick = (e) => {
      const inTrigger = triggerRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) onClose?.();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        className={`rf-nav-link ${isActive ? 'rf-nav-link-active' : ''} ${isOpen ? 'rf-nav-link-open' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="whitespace-nowrap">{label}</span>
        <Icon name="ChevronDown" size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && children?.length
        ? createPortal(
            <div
              ref={menuRef}
              className="rf-nav-dropdown rf-nav-dropdown--portal animate-fade-in"
              style={{
                top: coords.top,
                left: coords.left,
                minWidth: coords.minWidth,
              }}
              role="menu"
            >
              {children.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  role="menuitem"
                  onClick={() => onNavigate(item.path)}
                  className="rf-nav-dropdown-item"
                >
                  {item.icon ? (
                    <Icon name={item.icon} size={16} className="text-[var(--color-brand-green)] shrink-0" />
                  ) : null}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default HeaderNavDropdown;
