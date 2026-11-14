// ============================================================
// API SUPABASE — Toutes les requêtes de l'app
// ============================================================
import { supabase } from './supabaseClient';

// ---------- CHANGE EVENT ----------
const listeners = new Set();
export function onDataChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function emitChange() { listeners.forEach(cb => cb()); }

// ============================================================
// FETCH TOUT (RLS filtre côté serveur selon le rôle)
// ============================================================
export async function fetchAllData() {
  // 1. On récupère l'utilisateur actuel
  const { data: { session } } = await supabase.auth.getSession();
  const currentUser = session?.user;
  if (!currentUser) return emptyData();

  // 2. On récupère son profil pour connaître son rôle
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
  const role = profile?.role;

  // 3. Préparation des requêtes de base (toujours nécessaires)
  const baseQueries = [
    supabase.from('products').select('*').order('created_at'),
    supabase.from('kit_items').select('*').order('created_at'),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('profiles').select('*').limit(5000),
    supabase.from('custom_orders').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('profile_change_requests').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('daily_validations').select('*').order('date', { ascending: false }).limit(1000),
  ];

  // 4. On récupère les cartes et les jours UNIQUEMENT pour l'utilisateur connecté
  let cardsQuery = supabase.from('cards').select('*').order('created_at', { ascending: false });
  let cardDaysQuery = supabase.from('card_days').select('*').order('day_number');

  if (role === 'client') {
    cardsQuery = cardsQuery.eq('client_id', currentUser.id);
  } else if (role === 'collecteur') {
    cardsQuery = cardsQuery.eq('collector_id', currentUser.id);
  }
  // Si c'est un admin ou une secrétaire, on charge tout (mais avec pagination)

  const [productsRes, kitItemsRes, notifsRes, usersRes, ordersRes, requestsRes, validationsRes, cardsRes] =
    await Promise.all([...baseQueries, cardsQuery]);

  const allCards = cardsRes.data || [];
  const cardIds = allCards.map(c => c.id);

  // 5. Si on a des cartes, on charge leurs jours en plusieurs fois (Pagination)
  let allCardDays = [];
  if (cardIds.length > 0) {
    const CHUNK_SIZE = 500; // On charge par paquets de 500
    for (let i = 0; i < cardIds.length; i += CHUNK_SIZE) {
      const chunkIds = cardIds.slice(i, i + CHUNK_SIZE);
      // Pour chaque paquet de 500 cartes, on récupère TOUS les jours (avec pagination interne)
      let page = 0;
      const PAGE_SIZE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('card_days')
          .select('*')
          .in('card_id', chunkIds)
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) { console.error('[fetchAllData] card_days error:', error); break; }
        if (!data || data.length === 0) break;

        allCardDays = [...allCardDays, ...data];
        if (data.length < PAGE_SIZE) break; // Si on a moins que la page max, c'est fini
        page++;
      }
    }
  }

  return {
    products: productsRes.data || [],
    kitItems: kitItemsRes.data || [],
    notifications: notifsRes.data || [],
    cards: allCards,
    cardDays: allCardDays,
    users: usersRes.data || [],
    dailyValidations: validationsRes.data || [],
    customOrders: ordersRes.data || [],
    profileChangeRequests: requestsRes.data || [],
  };
}

// Petite fonction utilitaire
function emptyData() {
  return {
    products: [], kitItems: [], notifications: [], cards: [], cardDays: [],
    users: [], dailyValidations: [], customOrders: [], profileChangeRequests: []
  };
}
// ============================================================
// CARDS
// ============================================================
export async function addCard({ clientId, product, collectorId, quantity = 1, lockedPricePerDay, kitComposition }) {
  const isYear = product.product_type === '1_an';

  // On multiplie le prix de base par la quantité choisie
  const basePrice = lockedPricePerDay ?? product.price_per_day ?? 0;
  const finalPrice = basePrice * quantity;

  const { data, error } = await supabase.from('cards').insert({
    client_id: clientId,
    product_id: product.id,
    collector_id: collectorId,
    status: 'en_attente',
    period_label: isYear ? 'Mois 1 / 12' : 'Mois 1',
    locked_price_per_day: finalPrice, // Prix total par jour
    quantity: quantity,               // Nouvelle colonne
    current_month: isYear ? 1 : null,
    total_months: isYear ? 12 : null,
    months_completed: isYear ? 0 : null,
    kit_composition: kitComposition || null,
  }).select().single();

  if (error) { console.error('addCard:', error); return null; }
  emitChange();
  return data;
}

export async function activateCard(cardId, activatedBy) {
  const { error } = await supabase.from('cards').update({
    status: 'actif',
    activated_at: new Date().toISOString(),
    activated_by: activatedBy,
    card_fee_paid: true,
  }).eq('id', cardId);

  if (error) { console.error('activateCard:', error); return; }
  // Enregistrer la frais de carte
  await supabase.from('card_fees').insert({
    card_id: cardId, type: 'carte', amount: 200, collected_by: activatedBy,
  });
  emitChange();
}

export async function fillCardDays(cardId, monthNumber, dayNumbers, filledBy) {
  const { data: card } = await supabase.from('cards').select('locked_price_per_day').eq('id', cardId).single();
  const amount = card?.locked_price_per_day || 0;
  const now = new Date().toISOString();

  for (const day of dayNumbers) {
    // 1. On essaie de mettre à jour le jour
    const { data, error } = await supabase.from('card_days')
      .update({ filled: true, filled_at: now, filled_by: filledBy, amount, is_locked: false })
      .eq('card_id', cardId)
      .eq('month_number', monthNumber)
      .eq('day_number', day)
      .select();

    if (error) console.error('fillCardDays update:', error);

    // 2. Si le jour n'existe pas en base, on l'insère
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase.from('card_days').insert({
        card_id: cardId,
        month_number: monthNumber,
        day_number: day,
        filled: true,
        filled_at: now,
        filled_by: filledBy,
        amount,
        is_locked: false
      });
      if (insertError) console.error('fillCardDays insert:', insertError);
    }
  }
  emitChange();
}
// ============================================================
// NOTIFICATIONS
// ============================================================
export async function addNotification({ userId, type, message, link = null }) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId, type, message, link,
  });
  if (error) console.error('addNotification:', error);
  else emitChange();
}

export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
  emitChange();
}

export async function markAllRead(userId) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  emitChange();
}

// ============================================================
// SECRÉTAIRE
// ============================================================
export async function validateDay(collectorId, dateStr, validatedBy, totalAmount) {
  const { error } = await supabase.from('daily_validations').insert({
    collector_id: collectorId, date: dateStr,
    validated_by: validatedBy, total_amount: totalAmount, locked: true,
  });
  if (error) { console.error('validateDay:', error); return; }

  const { data: cards } = await supabase.from('cards').select('id').eq('collector_id', collectorId);
  const cardIds = (cards || []).map(c => c.id);
  if (cardIds.length) {
    const start = `${dateStr}T00:00:00.000Z`;
    const end = `${dateStr}T23:59:59.999Z`;

    await supabase.from('card_days')
      .update({ is_locked: true })
      .in('card_id', cardIds)
      .eq('filled', true)
      .gte('filled_at', start)
      .lte('filled_at', end);
  }

  // Notifier le collecteur
  const dateLabel = new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  await addNotification({
    userId: collectorId,
    type: 'journee_validee',
    message: `Journée du ${dateLabel} validée par la secrétaire. Vous pouvez reprendre votre activité.`,
    link: `/collecteur/journee/${dateStr}`,
  });

  emitChange();
}

export async function approveClientRegistration(clientId, collectorId = null) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, collector_id')
    .eq('id', clientId)
    .single();

  await supabase.from('profiles').update({
    status: 'actif',
    ...(collectorId ? { collector_id: collectorId } : {}),
  }).eq('id', clientId);

  // Notifier le client
  await addNotification({
    userId: clientId,
    type: 'compte_valide',
    message: `Votre compte a été validé. Bienvenue chez Emilio Transports !`,
    link: '/client',
  });

  // Notifier le collecteur s'il vient d'être assigné
  const assignedCollector = collectorId || profile?.collector_id;
  if (assignedCollector) {
    await addNotification({
      userId: assignedCollector,
      type: 'nouveau_client_assigne',
      message: `${profile?.name || 'Un nouveau client'} vous a été assigné.`,
      link: `/collecteur/client/${clientId}`,
    });
  }

  emitChange();
}

export async function rejectClientRegistration(clientId) {
  await supabase.from('profiles').update({ status: 'rejete' }).eq('id', clientId);

  await addNotification({
    userId: clientId,
    type: 'compte_rejete',
    message: `Votre demande de compte a été rejetée. Contactez la secrétaire pour plus d'informations.`,
    link: null,
  });

  emitChange();
}

export async function assignCollectorToClient(clientId, collectorId) {
  await supabase.from('profiles').update({ collector_id: collectorId }).eq('id', clientId);
  emitChange();
}

export async function changeUserRole(userId, newRole) {
  // Si on promeut (non-client), on active toujours le compte
  const updates = { role: newRole };
  if (newRole !== 'client') updates.status = 'actif';

  await supabase.from('profiles').update(updates).eq('id', userId);
  emitChange();
}

// ============================================================
// ADMIN — PRODUITS
// ============================================================
export async function addProduct(data) {
  const { data: prod, error } = await supabase.from('products').insert({
    name: data.name,
    description: data.description,
    price_per_day: data.price_per_day || 0,
    duration_days: data.duration_days || 31,
    product_type: data.product_type,
    photo_url: data.photo_url || null,
    is_active: data.is_active ?? true,
  }).select().single();
  if (error) { console.error('addProduct:', error); return null; }
  emitChange();
  return prod;
}

export async function updateProduct(id, updates) {
  await supabase.from('products').update(updates).eq('id', id);
  emitChange();
}

export async function toggleProductActive(id) {
  const { data } = await supabase.from('products').select('is_active').eq('id', id).single();
  if (!data) return;
  await supabase.from('products').update({ is_active: !data.is_active }).eq('id', id);
  emitChange();
}

// ============================================================
// ADMIN — KIT ITEMS
// ============================================================
export async function addKitItem(data) {
  const { error } = await supabase.from('kit_items').insert({
    name: data.name, price: data.price,
    photo_url: data.photo_url || null,
    kit_ids: data.kit_ids || [],
    is_active: true,
  });
  if (error) console.error('addKitItem:', error);
  emitChange();
}

export async function updateKitItem(id, updates) {
  await supabase.from('kit_items').update(updates).eq('id', id);
  emitChange();
}

export async function toggleKitItemActive(id) {
  const { data } = await supabase.from('kit_items').select('is_active').eq('id', id).single();
  if (!data) return;
  await supabase.from('kit_items').update({ is_active: !data.is_active }).eq('id', id);
  emitChange();
}

// ============================================================
// ADMIN — COMMANDES PERSONNALISÉES
// ============================================================
export async function updateCustomOrder(orderId, { status, adminResponse, productData = null }) {
  // Récupérer la commande pour notifier le bon client
  const { data: order } = await supabase
    .from('custom_orders')
    .select('client_id, description')
    .eq('id', orderId)
    .single();

  // Mise à jour du statut
  const { error } = await supabase.from('custom_orders').update({
    status,
    admin_response: adminResponse,
    reviewed_at: new Date().toISOString(),
  }).eq('id', orderId);

  if (error) {
    console.error('updateCustomOrder:', error);
    return { error: error.message };
  }

  // Si "ajoutée au catalogue" et productData fourni → créer le produit
  let createdProduct = null;
  if (status === 'ajoutee' && productData) {
    const { data: prod, error: pErr } = await supabase.from('products').insert({
      name: productData.name,
      description: productData.description,
      price_per_day: productData.price_per_day,
      duration_days: productData.product_type === '1_an' ? 372 : 31,
      product_type: productData.product_type,
      photo_url: productData.photo_url || null,
      is_active: true,
    }).select().single();

    if (pErr) console.error('createProductFromOrder:', pErr);
    else createdProduct = prod;
  }

  // Notification au client
  if (order?.client_id) {
    const labels = {
      acceptee: '✅ Votre commande a été acceptée.',
      refusee: '❌ Votre commande a été refusée.',
      ajoutee: '🎉 Votre commande a été ajoutée au catalogue ! Vous pouvez la retrouver dans Produits.',
    };
    await addNotification({
      userId: order.client_id,
      type: 'commande_personnalisee',
      message: `${labels[status] || 'Mise à jour'}${adminResponse ? ` — ${adminResponse}` : ''}`,
      link: status === 'ajoutee' ? '/client/produits' : '/client/produits',
    });
  }

  emitChange();
  return { product: createdProduct };
}
// ============================================================
// ADMIN — DEMANDES DE MODIFICATION CLIENT
// ============================================================
export async function addProfileChangeRequest(req) {
  await supabase.from('profile_change_requests').insert(req);
  emitChange();
}

export async function reviewProfileChangeRequest(reqId, status, adminNote, reviewedBy) {
  await supabase.from('profile_change_requests').update({
    status, admin_note: adminNote,
    reviewed_by: reviewedBy, reviewed_at: new Date().toISOString(),
  }).eq('id', reqId);
  emitChange();
}

// ============================================================
// CARDS (Suite)
// ============================================================
export async function deleteCard(cardId) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('deleteCard:', error);
    return { error: error.message };
  }
  emitChange();
  return { success: true };
}


// ============================================================
// CARDS — CLÔTURER UN MOIS (Produits 1 an)
// ============================================================
export async function closeCardMonth(cardId, completedMonth, nextMonth) {
  // S'assurer que les 31 jours du mois suivant existent en base
  const daysToInsert = [];
  for (let i = 1; i <= 31; i++) {
    daysToInsert.push({
      card_id: cardId,
      month_number: nextMonth,
      day_number: i,
      filled: false,
      is_locked: false,
      amount: 0
    });
  }

  await supabase.from('card_days').upsert(daysToInsert, { onConflict: 'card_id,month_number,day_number' });

  // Mettre à jour la carte
  const { error } = await supabase
    .from('cards')
    .update({
      months_completed: completedMonth,
      current_month: nextMonth,
    })
    .eq('id', cardId);

  if (error) {
    console.error('closeCardMonth:', error);
    return { error: error.message };
  }
  emitChange();
  return { success: true };
}
