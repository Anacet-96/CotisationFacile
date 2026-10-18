# 🛠️ Configuration Supabase — Emilio Transports

## 1. Créer le projet
1. Va sur https://supabase.com → New project.
2. Note l'URL du projet et la clé `anon` (Settings → API).

## 2. Base de données (SQL)
Exécute le script SQL fourni dans l'historique de développement (SQL Editor).
Il crée les tables : `profiles`, `products`, `cards`, `card_days`, `notifications`, `daily_validations`, `kit_items`, `custom_orders`, `profile_change_requests`, `card_fees`.
Il configure aussi les triggers (création auto des 31 jours, génération du numéro client) et les politiques RLS.

## 3. Stockage (Images)
Dans le menu Storage, crée un bucket public nommé **`media`**.
Ajoute les politiques RLS pour permettre l'upload aux utilisateurs authentifiés.

## 4. Authentification
1. Dans Authentication → Providers → Email : désactive "Confirm email" (pour faciliter les tests).
2. Va dans Authentication → Users → "Add user" pour créer ton tout premier compte.
3. Copie l'UUID de cet utilisateur et exécute ce SQL pour le passer admin :
   ```sql
   update public.profiles set role = 'admin', status = 'actif' where id = 'TON-UUID';