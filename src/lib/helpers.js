// ============================================================
// HELPERS — Emilio Transports
// ============================================================

// Formatage monétaire FCFA
export function formatFCFA(amount) {
  if (amount === null || amount === undefined) return '—';
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
}

// Formatage de date courte
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Formatage date + heure
export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Génération numéro client (mock — sera remplacé par un trigger Supabase)
// TODO Supabase : remplacer par la fonction generate_client_number()
export function generateClientNumber(existingNumbers = []) {
  const max = existingNumbers
    .map(n => parseInt(String(n).replace('CT-', ''), 10))
    .filter(n => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `CT-${String(max + 1).padStart(5, '0')}`;
}

// Calculs carte
export function computeCardStats(card, cardDays) {
  const days = cardDays.filter(d => d.card_id === card.id);
  const filled = days.filter(d => d.filled).length;
  const total = days.length || 31;
  const paidAmount = filled * (card.locked_price_per_day || 0);
  const totalAmount = total * (card.locked_price_per_day || 0);
  const remaining = totalAmount - paidAmount;
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  return { filled, total, paidAmount, totalAmount, remaining, percent };
}

// Classes conditionnelles simples
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Type produit → label FR
export function productTypeLabel(type) {
  return {
    '1_mois': '1 mois',
    '1_an': '1 an',
    'kit': 'Kit ravitaillement',
  }[type] || type;
}

// Statut carte → label FR
export function cardStatusLabel(status) {
  return {
    en_attente: 'En attente',
    actif: 'Actif',
    termine: 'Terminé',
    annule: 'Annulé',
  }[status] || status;
}

// Génère les mises (payments) à partir des card_days
export function buildMisesFromCards(cards, cardDays, products) {
  const mises = [];
  cardDays.forEach(day => {
    if (!day.filled) return;
    const card = cards.find(c => c.id === day.card_id);
    if (!card) return;
    const product = products.find(p => p.id === card.product_id);
    mises.push({
      id: day.id,
      card_id: card.id,
      product_name: product?.name || '—',
      day_number: day.day_number,
      amount: day.amount,
      filled_at: day.filled_at,
      was_modified: !!day.was_modified,
      period_label: card.period_label,
    });
  });
  return mises.sort((a, b) => new Date(b.filled_at) - new Date(a.filled_at));
}

// Filtre temporel pour l'historique
export function filterByPeriod(items, period) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return items.filter(item => {
    const d = new Date(item.filled_at);
    if (period === 'jour') return d >= startOfDay;
    if (period === 'semaine') {
      const start = new Date(startOfDay);
      start.setDate(start.getDate() - 6);
      return d >= start;
    }
    if (period === 'mois') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return d >= start;
    }
    return true; // 'tout'
  });
}

// ============================================================
// Carte 1 an — Retourne les 31 jours correspondant au mois demandé
// - Mois terminé (<= months_completed) : 31 jours remplis, verrouillés
// - Mois courant (= current_month) : les vrais card_days
// - Mois futur (> current_month) : 31 jours vides, verrouillés
// ============================================================
export function getCardDaysForMonth(card, allCardDays, month, isYear) {
  const baseDays = allCardDays.filter(d => d.card_id === card.id);

  if (!isYear) return baseDays;

  const current = card.current_month || 1;
  const completed = card.months_completed || 0;

  // Mois courant → vrai état
  if (month === current) return baseDays;

  const now = Date.now();
  const DAY = 86400000;

  // Mois terminé → 31 jours remplis, verrouillés
  if (month <= completed) {
    return Array.from({ length: 31 }, (_, i) => {
      const n = i + 1;
      return {
        id: `v-${card.id}-m${month}-d${n}`,
        card_id: card.id,
        day_number: n,
        filled: true,
        filled_at: new Date(now - (31 - n) * DAY).toISOString(),
        filled_by: card.collector_id,
        amount: card.locked_price_per_day,
        is_locked: true,
        virtual: true,
      };
    });
  }

  // Mois futur → 31 jours vides, verrouillés
  return Array.from({ length: 31 }, (_, i) => {
    const n = i + 1;
    return {
      id: `v-${card.id}-m${month}-d${n}`,
      card_id: card.id,
      day_number: n,
      filled: false,
      filled_at: null,
      filled_by: null,
      amount: 0,
      is_locked: true,
      virtual: true,
    };
  });
}

// Stats pour un mois spécifique (utile pour l'affichage)
export function getMonthStats(card, allCardDays, month, isYear) {
  const days = getCardDaysForMonth(card, allCardDays, month, isYear);
  const filled = days.filter(d => d.filled).length;
  return { filled, total: days.length, percent: Math.round((filled / days.length) * 100) };
}