import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import LanguageSwitcher from '../ui/LanguageSwitcher';

/**
 * White-sidebar portal layout — customer, agent, employee dashboards.
 * Narrow viewports show a persistent icon rail; full labels from lg up.
 */
const PortalShell = ({
  portalLabel = 'Dashboard',
  navItems = [],
  activeId,
  onNavSelect,
  userName = 'User',
  userRole = '',
  userId = '',
  avatarUrl,
  notificationCount = 0,
  onLogout,
  promoCard,
  children,
  headerActions,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavClick = (item) => {
    if (onNavSelect) onNavSelect(item);
    else if (item.path) navigate(item.path);
  };

  return (
    <div className="rf-portal min-h-screen bg-[#f4f6f8]">
      <aside className="rf-portal-sidebar">
        <div className="rf-portal-sidebar-header">
          <button type="button" onClick={() => navigate('/homepage')} className="rf-portal-logo-btn" title="RFINCARE Home">
            <BrandLogo size="icon" showTagline={false} className="rf-portal-logo-icon" />
            <BrandLogo size="sidebar" showTagline={false} className="rf-portal-logo-full" />
          </button>
        </div>

        <nav className="rf-portal-nav" aria-label={portalLabel}>
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => handleNavClick(item)}
                className={`rf-portal-nav-item ${isActive ? 'rf-portal-nav-item-active' : ''}`}
              >
                <Icon name={item.icon} size={18} />
                <span className="rf-portal-nav-label">{item.label}</span>
                {item.badge > 0 ? (
                  <span className="rf-portal-badge">{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {promoCard ? <div className="rf-portal-promo">{promoCard}</div> : null}

        <div className="rf-portal-sidebar-footer">
          <button type="button" onClick={onLogout} className="rf-portal-logout" title="Logout">
            <Icon name="LogOut" size={18} />
            <span className="rf-portal-logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="rf-portal-main">
        <header className="rf-portal-topbar">
          <div className="rf-portal-topbar-search hidden md:flex">
            <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, leads, customers..."
              className="rf-portal-search-input"
            />
            <span className="rf-portal-search-hint hidden xl:inline">Ctrl + K</span>
          </div>

          <div className="rf-portal-topbar-toolbar">
            <button
              type="button"
              className="rf-portal-home-btn"
              onClick={() => navigate('/homepage')}
              title="Back to Home"
            >
              <Icon name="Home" size={18} />
              <span className="rf-portal-home-btn-label">Back to Home</span>
            </button>

            {headerActions ? (
              <div className="rf-portal-header-actions">{headerActions}</div>
            ) : null}

            <div className="rf-portal-topbar-utilities">
              <button type="button" className="rf-portal-icon-btn hidden sm:flex" title="24x7 Support">
                <Icon name="Headphones" size={18} />
                <span className="rf-portal-utility-label">24x7 Support</span>
              </button>
              <button type="button" className="rf-portal-icon-btn relative" title="Notifications">
                <Icon name="Bell" size={18} />
                {notificationCount > 0 ? (
                  <span className="rf-portal-notif-dot">{notificationCount > 9 ? '9+' : notificationCount}</span>
                ) : null}
              </button>
              <LanguageSwitcher />
              <div className="rf-portal-profile">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center text-sm font-bold">
                    {userName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="rf-portal-profile-text min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {userId || userRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="rf-portal-content">{children}</main>
      </div>
    </div>
  );
};

export default PortalShell;
