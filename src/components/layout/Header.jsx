import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Bell, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useMockStore } from '../../lib/mockStore';
import MobileDrawer from './MobileDrawer';

export default function Header({ title }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const store = useMockStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unread = store.notifications.filter(n => n.user_id === user?.id && !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur border-b border-outline/40">
        <div className="flex items-center justify-between px-3 lg:px-4 py-3 max-w-lg lg:max-w-none mx-auto gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Burger (mobile) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-heading font-bold truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Thème"
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <Link
              to="/notifications"
              className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell size={22} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}