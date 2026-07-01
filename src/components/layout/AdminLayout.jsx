import React from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../ui/BrandLogo';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import {
  ADMIN_NAV_ITEMS,
  getAdminNavHref,
  isAdminNavItemActive,
} from '../../constants/adminNavigation';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-[100rem] mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-3 h-14 border-b border-border/60">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard?tab=applications')}
              className="flex items-center gap-2 shrink-0"
            >
              <BrandLogo size="sm" />
              <span className="hidden sm:inline text-sm font-semibold text-foreground">Admin</span>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 whitespace-nowrap"
                iconName="LogOut"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          <nav
            className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin"
            aria-label="Admin sections"
          >
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = isAdminNavItemActive(item, location.pathname, searchParams);
              const href = getAdminNavHref(item);
              return (
                <button
                  key={item.tab || item.path}
                  type="button"
                  onClick={() => navigate(href)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[100rem] mx-auto px-3 sm:px-4 py-5 md:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
