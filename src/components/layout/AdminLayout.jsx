import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../ui/BrandLogo';
import Icon from '../AppIcon';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import {
  ADMIN_NAV_ITEMS,
  getAdminNavHref,
  isAdminNavItemActive,
  getAdminTabFromSearch,
} from '../../constants/adminNavigation';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { userProfile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeTab = getAdminTabFromSearch(searchParams);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin-login');
  };

  const userName = userProfile?.full_name || userProfile?.fullName || 'Super Admin';
  const userRole = userProfile?.role === 'super_admin' ? 'Super Admin' : 'Admin';

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
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard?tab=applications')}
            className="rf-portal-logo-btn"
          >
            <BrandLogo size="lg" showTagline={false} />
          </button>
        </div>

        <nav className="rf-portal-nav" aria-label="Admin navigation">
          <button
            type="button"
            onClick={() => { setSidebarOpen(false); navigate('/admin-dashboard?tab=applications'); }}
            className={`rf-portal-nav-item ${location.pathname === '/admin-dashboard' && activeTab === 'applications' ? 'rf-portal-nav-item-active' : ''}`}
          >
            <Icon name="LayoutDashboard" size={18} />
            <span className="flex-1 text-left">Dashboard</span>
          </button>
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isAdminNavItemActive(item, location.pathname, searchParams);
            const href = getAdminNavHref(item);
            return (
              <button
                key={item.tab || item.path}
                type="button"
                onClick={() => { setSidebarOpen(false); navigate(href); }}
                className={`rf-portal-nav-item ${active ? 'rf-portal-nav-item-active' : ''}`}
              >
                <Icon name={item.icon} size={18} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rf-portal-promo">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Star" size={18} className="text-amber-500" />
            <span className="text-sm font-bold text-foreground">Premium Plan</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Unlock advanced analytics &amp; API access</p>
          <button type="button" className="w-full py-2 text-xs font-semibold text-white bg-[var(--color-brand-green)] rounded-lg hover:opacity-90">
            Upgrade Now
          </button>
        </div>

        <div className="rf-portal-sidebar-footer">
          <button type="button" onClick={handleLogout} className="rf-portal-logout">
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
                placeholder="Search users, applications, partners..."
                className="rf-portal-search-input"
              />
              <span className="rf-portal-search-hint hidden lg:inline">Ctrl + K</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button type="button" className="rf-portal-icon-btn relative" title="Notifications">
              <Icon name="Bell" size={18} />
              <span className="rf-portal-notif-dot">3</span>
            </button>
            <button type="button" className="rf-portal-icon-btn hidden sm:flex" title="Messages">
              <Icon name="MessageSquare" size={18} />
            </button>
            <LanguageSwitcher />
            <button type="button" className="rf-portal-icon-btn hidden sm:flex" title="Theme">
              <Icon name="Moon" size={18} />
            </button>
            <div className="rf-portal-profile">
              <div className="w-9 h-9 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center text-sm font-bold">
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="rf-portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
