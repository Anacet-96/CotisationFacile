// ============================================================
// MOCK STORE — Base de données réactive partagée entre toutes les pages
// Simule Supabase en mémoire. Une modif ici = re-render partout où
// le hook useMockStore() est consommé.
// TODO Supabase : remplacer par des requêtes + supabase.realtime
// ============================================================

import { useSyncExternalStore } from 'react';
import {
  mockCards, mockCardDays, mockUsers, mockProducts,
  mockKitItems, mockNotifications, mockDailyValidations,
  mockCustomOrders, mockProfileChangeRequests,
} from './mockData';

// ---------- State initial (copie profonde légère) ----------
let state = {
  cards: mockCards.map(c => ({ ...c })),
  cardDays: mockCardDays.map(d => ({ ...d })),
  users: mockUsers.map(u => ({ ...u })),
  products: mockProducts.map(p => ({ ...p })),
  kitItems: mockKitItems.map(k => ({ ...k })),
  notifications: mockNotifications.map(n => ({ ...n })),
  dailyValidations: mockDailyValidations.map(d => ({ ...d })),
  customOrders: mockCustomOrders.map(c => ({ ...c })),
  profileChangeRequests: mockProfileChangeRequests.map(p => ({ ...p })),
};

// ---------- Pub/Sub ----------
const listeners = new Set();

export function getState() { return state; }

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
  listeners.forEach(l => l());
}

// ---------- Hook React ----------
export function useMockStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

// ============================================================
// ACTIONS
// ============================================================

// Ajoute une carte + génère ses 31 card_days
export function addCard({ clientId, product, collectorId, lockedPricePerDay, kitComposition = null }) {
  const now = new Date().toISOString();
  const newCardId = `c-${Date.now()}`;
  const price = lockedPricePerDay ?? product.price_per_day ?? 0;

  const isYear = product.product_type === '1_an';
  const newCard = {
    id: newCardId,
    client_id: clientId,
    product_id: product.id,
    collector_id: collectorId,
    status: 'en_attente',          // attend l'activation par le collecteur
    period_label: isYear ? 'Mois 1 / 12' : 'Mois 1',
    activated_at: null,
    activated_by: null,
    locked_price_per_day: price,
    card_fee_paid: false,
    delivery_fee_paid: false,
    created_at: now,
    // spécifique 1 an
    ...(isYear ? { current_month: 1, total_months: 12, months_completed: 0 } : {}),
    // spécifique kit
    ...(kitComposition ? { kit_composition: kitComposition } : {}),
  };

  const newDays = Array.from({ length: 31 }, (_, i) => ({
    id: `cd-${newCardId}-${i + 1}`,
    card_id: newCardId,
    day_number: i + 1,
    filled: false,
    filled_at: null,
    filled_by: null,
    amount: 0,
    is_locked: false,
    was_modified: false,
  }));

  setState(s => ({
    ...s,
    cards: [...s.cards, newCard],
    cardDays: [...s.cardDays, ...newDays],
  }));

  return newCard;
}

// Active une carte (frais 200 FCFA payés)
export function activateCard(cardId, activatedBy) {
  setState(s => ({
    ...s,
    cards: s.cards.map(c =>
      c.id === cardId
        ? {
            ...c,
            status: 'actif',
            activated_at: new Date().toISOString(),
            activated_by: activatedBy,
            card_fee_paid: true,
          }
        : c
    ),
  }));
}

// Remplit des card_days (valide des mises)
export function fillCardDays(cardId, dayNumbers, filledBy) {
  const setNums = new Set(dayNumbers);
  setState(s => {
    const card = s.cards.find(c => c.id === cardId);
    const amount = card?.locked_price_per_day || 0;
    const nowIso = new Date().toISOString();
    return {
      ...s,
      cardDays: s.cardDays.map(d => {
        if (d.card_id !== cardId || !setNums.has(d.day_number)) return d;
        return { ...d, filled: true, filled_at: nowIso, filled_by: filledBy, amount };
      }),
    };
  });
}

// Ajoute une notification
export function addNotification({ userId, type, message, link = null }) {
  const notif = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    type,
    message,
    link,
    read: false,
    created_at: new Date().toISOString(),
  };
  setState(s => ({ ...s, notifications: [notif, ...s.notifications] }));
  return notif;
}

// Marque une notification comme lue
export function markNotificationRead(id) {
  setState(s => ({
    ...s,
    notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
  }));
}

// Marque toutes les notifs d'un user comme lues
export function markAllRead(userId) {
  setState(s => ({
    ...s,
    notifications: s.notifications.map(n =>
      n.user_id === userId ? { ...n, read: true } : n
    ),
  }));
}

// Ajoute une demande de modification client
export function addProfileChangeRequest(req) {
  const newReq = {
    id: `pcr-${Date.now()}`,
    status: 'en_attente',
    admin_note: null,
    created_at: new Date().toISOString(),
    ...req,
  };
  setState(s => ({
    ...s,
    profileChangeRequests: [newReq, ...s.profileChangeRequests],
  }));
  return newReq;
}

// ============================================================
// ACTIONS SECRÉTAIRE
// ============================================================

// Valide la journée d'un collecteur (verrouille les mises du jour)
export function validateDay(collectorId, dateStr, validatedBy, totalAmount) {
  const validation = {
    id: `dv-${Date.now()}`,
    collector_id: collectorId,
    date: dateStr,
    validated_by: validatedBy,
    validated_at: new Date().toISOString(),
    total_amount: totalAmount,
    locked: true,
  };

  setState(s => {
    // Verrouille définitivement tous les card_days remplis ce jour-là
    const collectorCards = s.cards.filter(c => c.collector_id === collectorId).map(c => c.id);
    const lockedDays = s.cardDays.map(d => {
      if (!collectorCards.includes(d.card_id)) return d;
      if (!d.filled || !d.filled_at) return d;
      if (d.filled_at.slice(0, 10) !== dateStr) return d;
      return { ...d, is_locked: true };
    });

    return {
      ...s,
      cardDays: lockedDays,
      dailyValidations: [...s.dailyValidations, validation],
    };
  });

  // Notification au collecteur
  const date = new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  addNotification({
    userId: collectorId,
    type: 'journee_validee',
    message: `Journée du ${date} validée par la secrétaire. Vous pouvez reprendre votre activité.`,
    link: '/collecteur',
  });

  return validation;
}

// Rejette une inscription client (nouveau client en attente)
export function rejectClientRegistration(clientId) {
  setState(s => ({
    ...s,
    users: s.users.map(u =>
      u.id === clientId ? { ...u, status: 'rejete' } : u
    ),
  }));
}

// Approuve un nouveau client
export function approveClientRegistration(clientId, collectorId = null) {
  setState(s => ({
    ...s,
    users: s.users.map(u =>
      u.id === clientId
        ? { ...u, status: 'actif', collector_id: collectorId || u.collector_id }
        : u
    ),
  }));
}

// Assigne un collecteur à un client
export function assignCollectorToClient(clientId, collectorId) {
  setState(s => ({
    ...s,
    users: s.users.map(u =>
      u.id === clientId ? { ...u, collector_id: collectorId } : u
    ),
  }));
}

// Change le rôle d'un utilisateur (secrétaire peut mettre 'collecteur' seulement)
export function changeUserRole(userId, newRole) {
  setState(s => ({
    ...s,
    users: s.users.map(u => (u.id === userId ? { ...u, role: newRole } : u)),
  }));
}

// Approuve / rejette une demande de modification client
export function reviewProfileChangeRequest(reqId, status, adminNote, reviewedBy) {
  setState(s => {
    const req = s.profileChangeRequests.find(r => r.id === reqId);
    if (!req) return s;

    // Si approuvé et concerne un champ client précis, on applique
    let users = s.users;
    if (status === 'approuvee' && req.field_name && req.field_name !== 'profile') {
      users = s.users.map(u =>
        u.id === req.client_id ? { ...u, [req.field_name]: req.new_value } : u
      );
    }

    return {
      ...s,
      users,
      profileChangeRequests: s.profileChangeRequests.map(r =>
        r.id === reqId
          ? { ...r, status, admin_note: adminNote, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }
          : r
      ),
    };
  });
}

// ============================================================
// ACTIONS ADMIN
// ============================================================

// ---------- PRODUITS ----------
export function addProduct(data) {
  const product = {
    id: `p-${Date.now()}`,
    is_active: true,
    photo_url: null,
    created_at: new Date().toISOString(),
    ...data,
  };
  setState(s => ({ ...s, products: [...s.products, product] }));
  return product;
}

export function updateProduct(id, updates) {
  setState(s => ({
    ...s,
    products: s.products.map(p => (p.id === id ? { ...p, ...updates } : p)),
  }));
}

export function toggleProductActive(id) {
  setState(s => ({
    ...s,
    products: s.products.map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    ),
  }));
}

// ---------- KIT ITEMS ----------
export function addKitItem(data) {
  const item = {
    id: `ki-${Date.now()}`,
    is_active: true,
    ...data,
  };
  setState(s => ({ ...s, kitItems: [...s.kitItems, item] }));
  return item;
}

export function updateKitItem(id, updates) {
  setState(s => ({
    ...s,
    kitItems: s.kitItems.map(i => (i.id === id ? { ...i, ...updates } : i)),
  }));
}

export function toggleKitItemActive(id) {
  setState(s => ({
    ...s,
    kitItems: s.kitItems.map(i =>
      i.id === id ? { ...i, is_active: !i.is_active } : i
    ),
  }));
}

// ---------- COMMANDES PERSONNALISÉES ----------
export function updateCustomOrder(orderId, { status, adminResponse }) {
  setState(s => {
    const order = s.customOrders.find(o => o.id === orderId);
    if (!order) return s;
    return {
      ...s,
      customOrders: s.customOrders.map(o =>
        o.id === orderId
          ? {
              ...o,
              status,
              admin_response: adminResponse,
              reviewed_at: new Date().toISOString(),
            }
          : o
      ),
    };
  });

  // Notification au client
  const order = getState().customOrders.find(o => o.id === orderId);
  if (order) {
    const labels = {
      acceptee: '✅ Votre commande a été acceptée.',
      refusee: '❌ Votre commande a été refusée.',
      ajoutee: '🎉 Votre commande a été ajoutée au catalogue !',
    };
    addNotification({
      userId: order.client_id,
      type: 'commande_personnalisee',
      message: `${labels[status] || 'Mise à jour'} ${adminResponse ? `— ${adminResponse}` : ''}`,
      link: '/client/produits',
    });
  }
}

// ---------- CRÉATION COMPTE ----------
export function addUser(data) {
  const user = {
    id: `u-${Date.now()}`,
    client_number: null,
    collector_id: null,
    status: 'actif',
    ...data,
  };
  // Générer numéro client si rôle client
  if (user.role === 'client' && !user.client_number) {
    const existing = getState().users
      .filter(u => u.client_number)
      .map(u => u.client_number);
    const max = existing
      .map(n => parseInt(String(n).replace('CT-', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    user.client_number = `CT-${String(max + 1).padStart(5, '0')}`;
  }
  setState(s => ({ ...s, users: [...s.users, user] }));
  return user;
}