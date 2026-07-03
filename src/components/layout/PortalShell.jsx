import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import LanguageSwitcher from '../ui/LanguageSwitcher';

/**
 * White-sidebar portal layout — customer, agent, employee dashboards.
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavClick = (item) => {
    setSidebarOpen(false);
    if (onNavSelect) onNavSelect(item);
    else if (item.path) navigate(item.path);
  };

  return (
    <div className="rf-portal min-h-screen bg-[#f4f6f8]">
      {sidebarOpen ? (
        <button
          type="button"
          className="rf-portal-overlay lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside className={`rf-portal-sidebar ${sidebarOpen ? 'rf-portal-sidebar-open' : ''}`}>
        <div className="rf-portal-sidebar-header">
          <button type="button" onClick={() => navigate('/homepage')} className="rf-portal-logo-btn">
              <BrandLogo size="lg" showTagline={false} />
          </button>
        </div>

        <nav className="rf-portal-nav" aria-label={portalLabel}>
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`rf-portal-nav-item ${isActive ? 'rf-portal-nav-item-active' : ''}`}
              >
                <Icon name={item.icon} size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 ? (
                  <span className="rf-portal-badge">{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {promoCard ? <div className="rf-portal-promo">{promoCard}</div> : null}

        <div className="rf-portal-sidebar-footer">
          <button type="button" onClick={onLogout} className="rf-portal-logout">
            <Icon name="LogOut" size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="rf-portal-main">
        <header className="rf-portal-topbar">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="rf-portal-menu-btn lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="Menu" size={22} />
            </button>
            <div className="rf-portal-search hidden md:flex">
              <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, leads, customers..."
                className="rf-portal-search-input"
              />
              <span className="rf-portal-search-hint hidden lg:inline">Ctrl + K</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerActions}
            <button type="button" className="rf-portal-icon-btn hidden sm:flex" title="24x7 Support">
              <Icon name="Headphones" size={18} />
              <span className="hidden xl:inline text-xs font-medium">24x7 Support</span>
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
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{userName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {userId || userRole}
                </p>
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
