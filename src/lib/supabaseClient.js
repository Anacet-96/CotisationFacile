// ============================================================
// SUPABASE CLIENT — Emilio Transports
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ [Supabase] Variables manquantes. Vérifie ton fichier .env à la racine.'
  );
}

// Client principal : persiste la session (utilisé par AuthContext)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Client secondaire : ne touche PAS à la session principale.
// Utilisé pour créer un compte client sans déconnecter le collecteur.
export const supabaseCreateUser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'emilio-secondary-auth',
  },
});