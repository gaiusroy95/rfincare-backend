import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getLoginPathForRole, resolveEffectiveRole } from '../../lib/portalLoginUtils';
import { useMarketplaceVisibility } from '../../contexts/MarketplaceVisibilityContext';
import { employeeCanReachRoute } from '../../utils/employeeAccess';
import { buildMainNavGroups, QUICK_SEARCH_LINKS, TRUST_BAR_ITEMS } from '../../constants/mainNav';
import Icon from '../AppIcon';
import BrandLogo from './BrandLogo';
import HeaderNavDropdown from './HeaderNavDropdown';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, userProfile, employeeAccess, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const { visibility: marketplaceVisibility } = useMarketplaceVisibility();

  const isGuest = !user;
  const currentRole = resolveEffectiveRole(user, userProfile) || 'customer';
  const isAdminRole = currentRole === 'admin' || currentRole === 'super_admin';
  const isStaffPortalRole = currentRole === 'agent' || currentRole === 'employee';
  /**
   * Agents & employees use Documents / Reports / Referrals in the dashboard sidebar.
   * Whenever Header renders for them (or customers/guests), show the main marketing nav —
   * never the old portal shortcut tabs.
   */
  const showMarketingNav = !isAdminRole;

  const DASHBOARD_BY_ROLE = {
    customer: '/customer-dashboard',
    agent: '/agent-dashboard',
    employee: '/employee-portal',
    admin: '/admin-dashboard',
    super_admin: '/admin-dashboard',
  };
  const dashboardPath = DASHBOARD_BY_ROLE[currentRole] || '/homepage';

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setSearchOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const handleClick = (e) => {
      if (!e.target.closest('.rf-search-wrap')) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [searchOpen]);

  const mainNavGroups = useMemo(
    () => buildMainNavGroups({ marketplaceVisibility, t }),
    [marketplaceVisibility, t],
  );

  /** Admin-only header shortcuts. Staff tools live in portal sidebars. */
  const portalNavItems = useMemo(() => {
    if (isStaffPortalRole) return [];
    const items = [
      { label: t('header.myDashboard'), path: '/customer-dashboard', roles: ['customer'] },
      { label: t('header.agentDashboard'), path: '/agent-dashboard', roles: ['agent'] },
      { label: t('header.adminDashboard'), path: '/admin-dashboard', roles: ['admin', 'super_admin'] },
      { label: t('header.employeePortal'), path: '/employee-portal', roles: ['employee'] },
      { label: t('header.documents'), path: '/document-management-center', roles: ['admin', 'super_admin'] },
      { label: t('header.reports'), path: '/reports-and-analytics', roles: ['admin', 'super_admin'] },
    ];
    return items.filter((item) => {
      if (!item.roles.includes(currentRole)) return false;
      if (currentRole === 'employee' && employeeAccess?.configured) {
        const checkPath = item.matchPath || item.path.split('?')[0];
        return employeeCanReachRoute(employeeAccess, checkPath);
      }
      return true;
    });
  }, [t, currentRole, employeeAccess, isStaffPortalRole]);

  /** Top-bar links exclude the primary dashboard path (shown as My Dashboard CTA). */
  const desktopPortalLinks = useMemo(() => {
    if (showMarketingNav || isStaffPortalRole) return [];
    return portalNavItems.filter((item) => {
      const basePath = (item.path || '').split('?')[0];
      if (dashboardPath && basePath === dashboardPath.split('?')[0] && !item.matchTab) {
        return false;
      }
      return true;
    });
  }, [portalNavItems, dashboardPath, showMarketingNav, isStaffPortalRole]);

  const isPathActive = useCallback(
    (path, matchTab) => {
      const basePath = String(path || '').split('?')[0];
      if (matchTab) {
        const params = new URLSearchParams(location.search);
        return (
          location?.pathname === basePath
          && params.get('tab') === matchTab
        );
      }
      return location?.pathname === basePath || location?.pathname?.startsWith(`${basePath}/`);
    },
    [location?.pathname, location.search],
  );

  const isGroupActive = useCallback(
    (group) => {
      if (group.path) return isPathActive(group.path);
      return group.children?.some((c) => isPathActive(c.path));
    },
    [isPathActive],
  );

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    const role = resolveEffectiveRole(user, userProfile);
    await signOut();
    setIsMobileMenuOpen(false);
    navigate(getLoginPathForRole(role), { replace: true });
  };

  const roleLabel = currentRole === 'super_admin' ? 'Admin' : t(`header.${currentRole}`);

  return (
    <>
      <header className="rf-header">
        {/* Tier 1 — Trust bar */}
        <div className="rf-trust-bar">
          <div className="rf-header-container">
            <div className="rf-trust-bar-inner">
              {TRUST_BAR_ITEMS.map((item, idx) => (
                <React.Fragment key={item.label}>
                  {idx > 0 && <span className="rf-trust-divider" aria-hidden>|</span>}
                  <span className="rf-trust-item">
                    <Icon name={item.icon} size={13} className="shrink-0 opacity-90" />
                    <span>{item.label}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Tier 2 — Main navigation */}
        <div className="rf-main-bar">
          <div className="rf-header-container">
            <div className="rf-main-bar-inner">
              {/* Logo */}
              <button
                type="button"
                className="rf-logo-btn shrink-0"
                onClick={() => handleNavigation('/homepage')}
                aria-label="Rfincare home"
              >
                <BrandLogo size="xl" />
              </button>

              {/* Desktop nav */}
              {showMarketingNav && (
                <nav className="rf-desktop-nav" aria-label="Main navigation">
                  {mainNavGroups.map((group) => {
                    if (group.path) {
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => handleNavigation(group.path)}
                          className={`rf-nav-link ${isPathActive(group.path) ? 'rf-nav-link-active' : ''}`}
                        >
                          {group.label}
                        </button>
                      );
                    }
                    return (
                      <HeaderNavDropdown
                        key={group.id}
                        label={group.label}
                        children={group.children}
                        isOpen={openDropdown === group.id}
                        onToggle={() => setOpenDropdown((prev) => (prev === group.id ? null : group.id))}
                        onClose={() => setOpenDropdown(null)}
                        onNavigate={handleNavigation}
                        isActive={isGroupActive(group)}
                      />
                    );
                  })}
                </nav>
              )}

              {!showMarketingNav && desktopPortalLinks.length > 0 && (
                <nav className="rf-desktop-nav" aria-label="Portal navigation">
                  {desktopPortalLinks.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavigation(item.path)}
                      className={`rf-nav-link ${isPathActive(item.path, item.matchTab) ? 'rf-nav-link-active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}

              {/* Actions */}
              <div className="rf-header-actions">
                <LanguageSwitcher />

                {showMarketingNav && (
                  <div className="relative hidden sm:block rf-search-wrap">
                    <button
                      type="button"
                      className="rf-search-btn"
                      aria-label="Search"
                      aria-expanded={searchOpen}
                      onClick={() => setSearchOpen((v) => !v)}
                    >
                      <Icon name="Search" size={18} />
                    </button>
                    {searchOpen && (
                      <div className="rf-search-panel animate-fade-in">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Quick links</p>
                        {QUICK_SEARCH_LINKS.map((link) => (
                          <button
                            key={link.path}
                            type="button"
                            className="rf-nav-dropdown-item"
                            onClick={() => handleNavigation(link.path)}
                          >
                            <Icon name={link.icon} size={16} className="text-[var(--color-brand-green)]" />
                            <span>{link.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isGuest && (
                  <span className={`role-badge ${currentRole} hidden lg:inline-flex`}>{roleLabel}</span>
                )}

                {isGuest ? (
                  <>
                    <button
                      type="button"
                      className="rf-btn-login hidden sm:inline-flex"
                      onClick={() => handleNavigation('/customer-login')}
                    >
                      {t('header.login', 'Login')}
                    </button>
                    <button
                      type="button"
                      className="rf-btn-cta hidden sm:inline-flex"
                      onClick={() => handleNavigation('/eligibility-assessment')}
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <>
                    {dashboardPath && (
                      <button
                        type="button"
                        className="rf-btn-cta hidden sm:inline-flex"
                        onClick={() => handleNavigation(dashboardPath)}
                      >
                        My Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      className="rf-btn-login hidden sm:inline-flex"
                      onClick={handleLogout}
                    >
                      {t('header.logout', 'Log out')}
                    </button>
                  </>
                )}

                {children}

                <button
                  type="button"
                  className="rf-mobile-toggle lg:hidden"
                  onClick={() => setIsMobileMenuOpen((o) => !o)}
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMobileMenuOpen}
                >
                  <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="rf-mobile-menu lg:hidden animate-slide-in">
          <div className="rf-mobile-menu-content">
            {showMarketingNav ? (
              mainNavGroups.map((group) => {
                if (group.path) {
                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={`rf-mobile-link ${isPathActive(group.path) ? 'active' : ''}`}
                      onClick={() => handleNavigation(group.path)}
                    >
                      {group.label}
                    </button>
                  );
                }
                const expanded = mobileExpanded === group.id;
                return (
                  <div key={group.id} className="rf-mobile-group">
                    <button
                      type="button"
                      className="rf-mobile-link rf-mobile-group-toggle"
                      onClick={() => setMobileExpanded(expanded ? null : group.id)}
                    >
                      <span>{group.label}</span>
                      <Icon name="ChevronDown" size={18} className={expanded ? 'rotate-180' : ''} />
                    </button>
                    {expanded && (
                      <div className="rf-mobile-sub">
                        {group.children.map((item) => (
                          <button
                            key={item.path}
                            type="button"
                            className="rf-mobile-sublink"
                            onClick={() => handleNavigation(item.path)}
                          >
                            <Icon name={item.icon} size={16} />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              portalNavItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={`rf-mobile-link ${isPathActive(item.path, item.matchTab) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              ))
            )}

            <div className="rf-mobile-cta-row">
              {isGuest ? (
                <>
                  <button type="button" className="rf-btn-login w-full justify-center" onClick={() => handleNavigation('/customer-login')}>
                    {t('header.login', 'Login')}
                  </button>
                  <button type="button" className="rf-btn-cta w-full justify-center" onClick={() => handleNavigation('/eligibility-assessment')}>
                    Get Started
                  </button>
                </>
              ) : (
                <button type="button" className="rf-btn-login w-full justify-center text-destructive border-destructive/40" onClick={handleLogout}>
                  {t('header.logout', 'Log out')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header (trust bar + main bar) */}
      <div className="rf-header-spacer" />
    </>
  );
};

export default Header;
