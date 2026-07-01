import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { employeeCanReachRoute } from '../../utils/employeeAccess';
import Icon from '../AppIcon';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLogo from './BrandLogo';

const PUBLIC_GUEST_PATHS = new Set([
  '/',
  '/homepage',
  '/about-us',
  '/contact-us',
  '/product-comparison',
  '/eligibility-assessment',
  '/bank-marketplace',
  '/customer-assessment-portal',
  '/login-page',
  '/customer-login',
  '/share-your-story',
]);

function isPublicGuestRoute(pathname) {
  if (!pathname) return true;
  if (pathname.startsWith('/legal/')) return true;
  if (pathname.startsWith('/products/')) return true;
  return PUBLIC_GUEST_PATHS.has(pathname);
}

const Header = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, userProfile, employeeAccess } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isGuest = !user;
  const currentRole = userProfile?.role || 'customer';
  const showGuestNav = isGuest && isPublicGuestRoute(location?.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const guestPrimaryNav = useMemo(
    () => [
      { label: t('header.home'), path: '/homepage', icon: 'Home' },
      { label: 'About Us', path: '/about-us', icon: 'Info' },
      { label: 'Product Comparison', path: '/product-comparison', icon: 'GitCompare' },
      { label: 'Check Eligibility', path: '/eligibility-assessment', icon: 'CheckCircle' },
      { label: 'Contact Us', path: '/contact-us', icon: 'Phone' },
    ],
    [t],
  );

  const guestMoreNav = useMemo(
    () => [
      { label: t('header.applyForLoan'), path: '/eligibility-assessment', icon: 'FileText' },
      { label: t('header.bankMarketplace'), path: '/bank-marketplace', icon: 'Building2' },
    ],
    [t],
  );

  const authenticatedNav = useMemo(
    () => [
      { label: t('header.home'), path: '/homepage', icon: 'Home', roles: ['customer', 'agent', 'admin', 'super_admin', 'employee'] },
      { label: t('header.applyForLoan'), path: '/eligibility-assessment', icon: 'FileText', roles: ['customer'] },
      { label: t('header.bankMarketplace'), path: '/bank-marketplace', icon: 'Building2', roles: ['customer'] },
      { label: t('header.myDashboard'), path: '/customer-dashboard', icon: 'LayoutDashboard', roles: ['customer'] },
      { label: t('header.agentDashboard'), path: '/agent-dashboard', icon: 'Users', roles: ['agent'] },
      { label: t('header.adminDashboard'), path: '/admin-dashboard', icon: 'Shield', roles: ['admin', 'super_admin'] },
      { label: t('header.employeePortal'), path: '/employee-portal', icon: 'Briefcase', roles: ['employee'] },
      { label: t('header.documents'), path: '/document-management-center', icon: 'FolderOpen', roles: ['agent', 'admin', 'super_admin', 'employee'] },
      { label: t('header.reports'), path: '/reports-and-analytics', icon: 'BarChart3', roles: ['admin', 'super_admin', 'employee'] },
    ],
    [t],
  );

  const authItems = authenticatedNav.filter((item) => {
    if (!item.roles.includes(currentRole)) return false;
    if (currentRole === 'employee' && employeeAccess?.configured) {
      return employeeCanReachRoute(employeeAccess, item.path);
    }
    return true;
  });
  const visibleNavItems = showGuestNav ? guestPrimaryNav : authItems.slice(0, 5);
  const moreNavItems = showGuestNav ? guestMoreNav : authItems.slice(5);
  const mobileItems = showGuestNav ? [...guestPrimaryNav, ...guestMoreNav] : authItems;

  const isActive = (path) => location?.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const roleLabel = currentRole === 'super_admin' ? 'Admin' : t(`header.${currentRole}`);

  return (
    <>
      <header className={`header-container ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="header-content">
          <div className="header-inner">
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="header-logo cursor-pointer" onClick={() => handleNavigation('/homepage')} role="button" tabIndex={0}>
                <BrandLogo size="md" />
              </div>
              {showGuestNav && (
                <Button variant="outline" size="sm" onClick={() => handleNavigation('/customer-login')}>
                  {t('header.login', 'Login')}
                </Button>
              )}
            </div>

            {/* Desktop menu bar — hidden below md */}
            <nav className="header-nav">
              {visibleNavItems.map((item) => (
                <button key={item.path} type="button" onClick={() => handleNavigation(item.path)} className={`header-nav-item ${isActive(item.path) ? 'active' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
              {moreNavItems.length > 0 && (
                <div className="relative group">
                  <button type="button" className="header-nav-item flex items-center space-x-1">
                    <span>{t('header.more')}</span>
                    <Icon name="ChevronDown" size={16} />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="py-2">
                      {moreNavItems.map((item) => (
                        <button key={item.path} type="button" onClick={() => handleNavigation(item.path)} className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2">
                          <Icon name={item.icon} size={16} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            <div className="header-actions">
              <LanguageSwitcher />
              {!isGuest && <span className={`role-badge ${currentRole}`}>{roleLabel}</span>}
              {children}
              {/* Menu icon — visible only below md (when menu bar is hidden) */}
              <Button
                variant="ghost"
                size="icon"
                className="header-mobile-toggle"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="mobile-menu animate-slide-in md:hidden">
          <div className="mobile-menu-content">
            {mobileItems.map((item) => (
              <button key={item.path} type="button" onClick={() => handleNavigation(item.path)} className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}>
                <div className="flex items-center space-x-3">
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
};

export default Header;
