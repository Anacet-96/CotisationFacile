import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charge le profil public.profiles pour un user auth
  async function loadProfile(authUser) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('[Auth] Erreur chargement profil :', error);
      return null;
    }
    return data;
  }

  // Fusionne auth.users + profiles en un seul objet user
  async function buildUser(authUser) {
    const profile = await loadProfile(authUser);
    if (!profile) return null;
    return {
      id: authUser.id,
      email: authUser.email,
      ...profile,
    };
  }

  // Au démarrage : restaurer la session si elle existe
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const u = await buildUser(session.user);
          if (mounted) setUser(u);
        }
      } catch (e) {
        console.error('[Auth] Erreur init :', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Écoute les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const u = await buildUser(session.user);
          if (mounted) setUser(u);
        } else {
          if (mounted) setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ---------- CONNEXION ----------
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { error: translateError(error.message) };
    }

    // FORCER LE RAFRAÎCHISSEMENT DU TOKEN
    await supabase.auth.refreshSession();

    const u = await buildUser(data.user);
    if (!u) {
      await supabase.auth.signOut();
      return { error: 'Profil introuvable. Contactez un administrateur.' };
    }

    if (u.status === 'rejete' && u.role === 'client') {
      await supabase.auth.signOut();
      return { error: 'Votre compte a été rejeté.' };
    }

    if (u.status === 'en_attente' && u.role === 'client') {
      await supabase.auth.signOut();
      return {
        error: "Votre compte est en attente de validation par la secrétaire. Vous serez notifié dès qu'il sera activé.",
      };
    }

    setUser(u);
    return { user: u };
  }

  // ---------- INSCRIPTION ----------
  async function signUp(payload) {
    const { email, password, name, phone, city, district, profession, status } = payload;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name,
          phone,
          city,
          district,
          profession: profession || null,
          role: 'client',
          status: status || 'actif',
        },
      },
    });

    if (error) {
      return { error: translateError(error.message) };
    }

    if (data.session) {
      const u = await buildUser(data.user);
      setUser(u);
      return { user: u };
    }

    return { needsConfirmation: true };
  }

  // ---------- DÉCONNEXION ----------
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const value = {
    user,
    loading,
    role: user?.role || null,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}

// Traduit les messages d'erreur Supabase en français
function translateError(msg) {
  if (!msg) return 'Erreur inconnue.';
  if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed')) return 'Veuillez confirmer votre email avant de vous connecter.';
  if (msg.includes('User already registered')) return 'Cet email est déjà utilisé.';
  if (msg.includes('Password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (msg.includes('Unable to validate email')) return 'Adresse email invalide.';
  return msg;
}