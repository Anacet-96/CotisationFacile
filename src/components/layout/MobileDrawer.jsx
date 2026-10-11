import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CreditCard, Package, History, User, Home, Users,
  LayoutDashboard, UserCheck, BarChart3, Shield,
  UserCog, Sparkles, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../lib/helpers';

const NAV_BY_ROLE = {
  client: [
    { to: '/client', label: 'Mes cartes', icon: CreditCard, end: true },
    { to: '/client/produits', label: 'Catalogue', icon: Package },
    { to: '/client/historique', label: 'Historique', icon: History },
    { to: '/client/profil', label: 'Profil', icon: User },
  ],
  collecteur: [
    { to: '/collecteur', label: 'Accueil', icon: Home, end: true },
    { to: '/collecteur/historique', label: 'Historique', icon: History },
    { to: '/collecteur/performances', label: 'Performances', icon: BarChart3 },
    { to: '/collecteur/profil', label: 'Profil', icon: User },
  ],
  secretaire: [
    { to: '/secretaire', label: "Vue d'ensemble", icon: Home, end: true },
    { to: '/secretaire/collecteurs', label: 'Collecteurs', icon: Users },
    { to: '/secretaire/clients', label: 'Clients', icon: UserCheck },
    { to: '/secretaire/comptes', label: 'Comptes', icon: Shield },
    { to: '/secretaire/profil', label: 'Profil', icon: User },
  ],
  admin: [
    { to: '/admin', label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
    { to: '/admin/comptes', label: 'Comptes', icon: Users },
    { to: '/admin/produits', label: 'Produits & Kits', icon: Package },
    { to: '/admin/performances', label: 'Performances', icon: BarChart3 },
    { to: '/admin/commandes', label: 'Commandes', icon: Sparkles },
    { to: '/admin/demandes', label: 'Demandes', icon: UserCog },
    { to: '/admin/profil', label: 'Profil', icon: User },
  ],
};

export default function MobileDrawer({ open, onClose }) {
  const { role, user, signOut } = useAuth();
  const items = NAV_BY_ROLE[role] || [];

  // Fermer avec Échap
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Bloquer le scroll du body quand ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div
      className={cx(
        'lg:hidden fixed inset-0 z-50 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cx(
          'absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-card-light dark:bg-card-dark shadow-2xl flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-outline/40 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-light dark:bg-primary-dark flex items-center justify-center shrink-0">
              <span className="text-white font-heading font-extrabold text-lg">E</span>
            </div>
            <div className="min-w-0">
              <p className="font-heading font-extrabold text-base leading-tight truncate">
                Emilio
              </p>
              <p className="text-[10px] text-muted capitalize truncate">{role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User */}
        <div className="p-4 border-b border-outline/40">
          <p className="text-xs text-muted">Connecté en tant que</p>
          <p className="font-semibold text-sm truncate">{user?.name}</p>
          <p className="text-xs text-muted font-mono truncate">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition min-h-[48px]',
                  isActive
                    ? 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark'
                    : 'text-muted hover:bg-black/5 dark:hover:bg-white/5'
                )
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-outline/40">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 w-full min-h-[48px]"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </div>
  );
}