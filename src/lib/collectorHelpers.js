// ============================================================
// HELPERS COLLECTEUR
// ============================================================

// Vérifie si un collecteur est bloqué (journée précédente non validée)
export function isCollectorBlocked(collectorId, cards, validations) {
  if (!collectorId) return { blocked: false };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Exception : premier jour d'activité (aucune carte + aucune validation)
  const hasAnyValidation = validations.some(v => v.collector_id === collectorId);
  const hasAnyCard = cards.some(c => c.collector_id === collectorId);
  if (!hasAnyValidation && !hasAnyCard) return { blocked: false };

  const yesterdayValidation = validations.find(
    v => v.collector_id === collectorId && v.date === yesterdayStr
  );

  if (!yesterdayValidation) {
    return {
      blocked: true,
      reason: `Journée du ${yesterday.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })} en attente de validation par la secrétaire.`,
      yesterdayStr,
    };
  }
  return { blocked: false };
}

// Donne les clients d'un collecteur
export function getCollectorClients(collectorId, users) {
  return users.filter(u => u.role === 'client' && u.collector_id === collectorId);
}

// Donne les cartes d'un collecteur
export function getCollectorCards(collectorId, cards) {
  return cards.filter(c => c.collector_id === collectorId);
}

// Stats du jour pour un collecteur
export function getCollectorDayStats(collectorId, cards, cardDays, products, users) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Cartes activées aujourd'hui
  const cardsToday = cards.filter(c =>
    c.collector_id === collectorId &&
    c.activated_at &&
    c.activated_at.slice(0, 10) === todayStr
  );
  const cardsAmount = cardsToday.length * 200;

  // Mises reçues aujourd'hui
  const myCardIds = cards.filter(c => c.collector_id === collectorId).map(c => c.id);
  const misesToday = cardDays.filter(d =>
    myCardIds.includes(d.card_id) &&
    d.filled &&
    d.filled_at &&
    d.filled_at.slice(0, 10) === todayStr
  );
  const misesAmount = misesToday.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Livraisons (frais payés aujourd'hui sur produits 1_mois/kit)
  const livraisonsToday = cardsToday.filter(c => {
    const p = products.find(pp => pp.id === c.product_id);
    return p && (p.product_type === '1_mois' || p.product_type === 'kit') && c.delivery_fee_paid;
  });
  const livraisonsAmount = livraisonsToday.length * 1000;

  return {
    cardsCount: cardsToday.length,
    cardsAmount,
    misesCount: misesToday.length,
    misesAmount,
    livraisonsCount: livraisonsToday.length,
    livraisonsAmount,
    total: cardsAmount + misesAmount + livraisonsAmount,
  };
}

// Stats sur une période (pour performances)
export function getCollectorStats(collectorId, period, cards, cardDays, products) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let start;
  if (period === 'jour') start = startOfDay;
  else if (period === 'semaine') {
    start = new Date(startOfDay);
    start.setDate(start.getDate() - 6);
  } else if (period === 'mois') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
  }

  const inPeriod = iso => {
    if (!iso) return false;
    return new Date(iso) >= start;
  };

  const myCards = cards.filter(c => c.collector_id === collectorId);

  // Cartes vendues (activation dans la période)
  const cardsSold = myCards.filter(c => inPeriod(c.activated_at) && c.card_fee_paid);
  const cardsAmount = cardsSold.length * 200;

  // Mises collectées
  const myCardIds = myCards.map(c => c.id);
  const mises = cardDays.filter(d =>
    myCardIds.includes(d.card_id) && d.filled && inPeriod(d.filled_at)
  );
  const misesAmount = mises.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Livraisons
  const deliveries = myCards.filter(c => {
    if (!inPeriod(c.activated_at) || !c.delivery_fee_paid) return false;
    const p = products.find(pp => pp.id === c.product_id);
    return p && (p.product_type === '1_mois' || p.product_type === 'kit');
  });
  const deliveriesAmount = deliveries.length * 1000;

  return {
    cardsCount: cardsSold.length,
    cardsAmount,
    misesCount: mises.length,
    misesAmount,
    deliveriesCount: deliveries.length,
    deliveriesAmount,
    total: cardsAmount + misesAmount + deliveriesAmount,
  };
}