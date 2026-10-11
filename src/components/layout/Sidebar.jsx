import { NavLink } from 'react-router-dom';
import {
  CreditCard, Package, History, User, Home, Users,
  LayoutDashboard, UserCheck, LogOut, BarChart3, Shield,
  UserCog, Sparkles,
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

export default function Sidebar() {
  const { role, user, signOut } = useAuth();
  const items = NAV_BY_ROLE[role] || [];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-outline/40 bg-card-light dark:bg-card-dark h-screen sticky top-0">
      <div className="p-5 border-b border-outline/40">
        <h1 className="font-heading font-extrabold text-xl text-primary-light dark:text-primary-dark">
          Emilio Transports
        </h1>
        <p className="text-xs text-muted mt-1 truncate">
          {user?.name} · <span className="capitalize">{role}</span>
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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

      <div className="p-3 border-t border-outline/40">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-muted hover:bg-black/5 dark:hover:bg-white/5 w-full min-h-[48px]"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}