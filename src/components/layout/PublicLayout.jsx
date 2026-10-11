import { Link, Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, role } = useAuth();

  const homeByRole = {
    client: '/client',
    collecteur: '/collecteur',
    secretaire: '/secretaire',
    admin: '/admin',
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
      <header className="sticky top-0 z-30 border-b border-outline/30 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-light dark:bg-primary-dark flex items-center justify-center">
              <span className="text-white font-heading font-extrabold text-lg">E</span>
            </div>
            <span className="font-heading font-extrabold text-lg hidden sm:inline">
              Emilio Transports
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Thème"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <Link to={homeByRole[role] || '/'} className="btn-primary text-sm">
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="hidden sm:inline text-sm font-semibold text-muted px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Connexion
                </Link>
                <Link to="/inscription" className="btn-primary text-sm">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-muted border-t border-outline/30">
        © {new Date().getFullYear()} Emilio Transports — Cotisation Facile
      </footer>
    </div>
  );
}