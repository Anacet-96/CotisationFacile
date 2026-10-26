import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import RequireRole from './components/guards/RequireRole';
import RequireAuth from './components/guards/RequireAuth';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import Button from './components/ui/Button';
import OfflineDetector from './components/OfflineDetector';
import { Eye, EyeOff } from 'lucide-react';

// Public
import Onboarding from './pages/public/Onboarding';
import Inscription from './pages/public/Inscription';
import Confirmation from './pages/public/Confirmation';
import HorsLigne from './pages/public/HorsLigne';
import CommentCaMarche from './pages/public/CommentCaMarche';
import MotDePasseOublie from './pages/public/MotDePasseOublie';

// Client
import Cartes from './pages/client/Cartes';
import CarteDetail from './pages/client/CarteDetail';
import Produits from './pages/client/Produits';
import KitPanier from './pages/client/KitPanier';
import Historique from './pages/client/Historique';
import ProfilClient from './pages/client/Profil';
import CommandePersonnalisee from './pages/client/CommandePersonnalisee';

// Collecteur
import CollecteurLayout from './components/collecteur/CollecteurLayout';
import CollecteurDashboard from './pages/collecteur/Dashboard';
import CollecteurClientDetail from './pages/collecteur/ClientDetail';
import CollecteurNouveauClient from './pages/collecteur/NouveauClient';
import CollecteurNouvelleCarte from './pages/collecteur/NouvelleCarte';
import CollecteurHistorique from './pages/collecteur/Historique';
import CollecteurPerformances from './pages/collecteur/Performances';
import CollecteurProfil from './pages/collecteur/Profil';

// Secrétaire
import SecretaireDashboard from './pages/secretaire/Dashboard';
import SecretaireCollecteurs from './pages/secretaire/Collecteurs';
import SecretaireCollecteurDetail from './pages/secretaire/CollecteurDetail';
import SecretaireClients from './pages/secretaire/Clients';
import SecretaireComptes from './pages/secretaire/Comptes';
import SecretaireProfil from './pages/secretaire/Profil';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminComptes from './pages/admin/Comptes';
import AdminCompteDetail from './pages/admin/CompteDetail';
import AdminProduits from './pages/admin/Produits';
import AdminNouveauProduit from './pages/admin/NouveauProduit';
import AdminProduitDetail from './pages/admin/ProduitDetail';
import AdminPerformances from './pages/admin/Performances';
import AdminCollecteurDetail from './pages/admin/CollecteurDetail';
import AdminCommandes from './pages/admin/Commandes';
import AdminDemandes from './pages/admin/Demandes';
import AdminProfil from './pages/admin/Profil';

// Notifs unifiées
import Notifications from './pages/Notifications';


// ============================================================
// LOGIN
// ============================================================
function LoginPage() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Nouvel état
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return setErr('Veuillez remplir tous les champs.');
    const res = await signIn(email, password);
    if (res.error) setErr(res.error);
  }

  if (user) {
    const map = { client: '/client', collecteur: '/collecteur', secretaire: '/secretaire', admin: '/admin' };
    return <Navigate to={map[user.role] || '/'} replace />;
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto bg-card-light dark:bg-card-dark rounded-2xl border border-outline/40 p-8">
        <p className="text-sm text-muted mb-1">Entrez vos identifiants</p>
        <h1 className="text-3xl font-heading font-extrabold mb-8">Bon retour 👋</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Adresse email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Mot de passe</label>
            {/* NOUVEAU : Conteneur relatif pour placer l'œil à l'intérieur */}
            <div className="relative">
              <input
                className="input pr-12" // pr-12 pour ne pas écrire sous l'icône
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-content-light dark:hover:text-content-dark"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/mot-de-passe-oublie" className="text-sm text-primary-light dark:text-primary-dark font-semibold">
              Mot de passe oublié ?
            </Link>
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}
          <Button type="submit" className="w-full">Se connecter</Button>
        </form>
      </div>
    </div>
  );
}
// ============================================================
// ROUTES
// ============================================================
export default function App() {
  return (
    <>
      <OfflineDetector />

      <Routes>

        <Route path="/" element={<Onboarding />} />

        <Route element={<PublicLayout />}>
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
        </Route>

        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/hors-ligne" element={<HorsLigne />} />

        <Route element={<AppLayout />}>
          {/* Client */}
          <Route path="/client" element={<RequireRole role="client"><Cartes /></RequireRole>} />
          <Route path="/client/carte/:id" element={<RequireRole role="client"><CarteDetail /></RequireRole>} />
          <Route path="/client/produits" element={<RequireRole role="client"><Produits /></RequireRole>} />
          <Route path="/client/produits/kit/:id" element={<RequireRole role="client"><KitPanier /></RequireRole>} />
          <Route path="/client/commande-personnalisee" element={<RequireRole role="client"><CommandePersonnalisee /></RequireRole>} />
          <Route path="/client/historique" element={<RequireRole role="client"><Historique /></RequireRole>} />
          <Route path="/client/profil" element={<RequireRole role="client"><ProfilClient /></RequireRole>} />

          {/* Collecteur */}
          <Route
            path="/collecteur"
            element={
              <RequireRole role="collecteur">
                <CollecteurLayout />
              </RequireRole>
            }
          >
            <Route index element={<CollecteurDashboard />} />
            <Route path="client/:id" element={<CollecteurClientDetail />} />
            <Route path="nouveau-client" element={<CollecteurNouveauClient />} />
            <Route path="nouvelle-carte/:clientId" element={<CollecteurNouvelleCarte />} />
            <Route path="historique" element={<CollecteurHistorique />} />
            <Route path="performances" element={<CollecteurPerformances />} />
            <Route path="profil" element={<CollecteurProfil />} />
          </Route>

          {/* Secrétaire */}
          <Route path="/secretaire" element={<RequireRole role="secretaire"><SecretaireDashboard /></RequireRole>} />
          <Route path="/secretaire/collecteurs" element={<RequireRole role="secretaire"><SecretaireCollecteurs /></RequireRole>} />
          <Route path="/secretaire/collecteur/:id" element={<RequireRole role="secretaire"><SecretaireCollecteurDetail /></RequireRole>} />
          <Route path="/secretaire/clients" element={<RequireRole role="secretaire"><SecretaireClients /></RequireRole>} />
          <Route path="/secretaire/comptes" element={<RequireRole role="secretaire"><SecretaireComptes /></RequireRole>} />
          <Route path="/secretaire/profil" element={<RequireRole role="secretaire"><SecretaireProfil /></RequireRole>} />

          {/* Admin */}
          <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
          <Route path="/admin/comptes" element={<RequireRole role="admin"><AdminComptes /></RequireRole>} />
          <Route path="/admin/compte/:id" element={<RequireRole role="admin"><AdminCompteDetail /></RequireRole>} />
          <Route path="/admin/produits" element={<RequireRole role="admin"><AdminProduits /></RequireRole>} />
          <Route path="/admin/nouveau-produit" element={<RequireRole role="admin"><AdminNouveauProduit /></RequireRole>} />
          <Route path="/admin/produit/:id" element={<RequireRole role="admin"><AdminProduitDetail /></RequireRole>} />
          <Route path="/admin/performances" element={<RequireRole role="admin"><AdminPerformances /></RequireRole>} />
          <Route path="/admin/collecteur/:id" element={<RequireRole role="admin"><AdminCollecteurDetail /></RequireRole>} />
          <Route path="/admin/commandes" element={<RequireRole role="admin"><AdminCommandes /></RequireRole>} />
          <Route path="/admin/demandes" element={<RequireRole role="admin"><AdminDemandes /></RequireRole>} />
          <Route path="/admin/profil" element={<RequireRole role="admin"><AdminProfil /></RequireRole>} />

          {/* Notifs communes */}
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </>
  );
}