// ============================================================
// HELPERS COLLECTEUR
// ============================================================

export function isCollectorBlocked(collectorId, cards, validations, cardDays = []) {
  if (!collectorId) return { blocked: false };

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // ============================================================
  // CAS 1 : Journée d'aujourd'hui validée → PAUSE jusqu'à demain
  // ============================================================
  const todayValidated = validations.find(
    v => v.collector_id === collectorId && v.date === todayStr
  );
  if (todayValidated) {
    return {
      blocked: true,
      type: 'today_validated',
      reason: `Journée d'aujourd'hui validée par la secrétaire. Vous pourrez reprendre votre activité demain.`,
      dateStr: todayStr,
    };
  }

  // ============================================================
  // CAS 2 : Hier validée → OK, pas de blocage
  // ============================================================
  const yesterdayValidated = validations.find(
    v => v.collector_id === collectorId && v.date === yesterdayStr
  );
  if (yesterdayValidated) return { blocked: false };

  // ============================================================
  // CAS 3 : Hier non validée MAIS activité hier → BLOQUÉ
  // ============================================================
  const myCards = cards.filter(c => c.collector_id === collectorId);
  const myCardIds = myCards.map(c => c.id);

  const hadMisesYesterday = cardDays.some(
    d =>
      myCardIds.includes(d.card_id) &&
      d.filled &&
      d.filled_at &&
      d.filled_at.slice(0, 10) === yesterdayStr
  );

  const hadActivationsYesterday = myCards.some(
    c => c.activated_at && c.activated_at.slice(0, 10) === yesterdayStr
  );

  if (!hadMisesYesterday && !hadActivationsYesterday) {
    return { blocked: false };
  }

  return {
    blocked: true,
    type: 'yesterday_pending',
    reason: `Journée du ${yesterday.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })} en attente de validation par la secrétaire.`,
    dateStr: yesterdayStr,
  };
}

export function getCollectorClients(collectorId, users) {
  return users.filter(u => u.role === 'client' && u.collector_id === collectorId);
}

export function getCollectorCards(collectorId, cards) {
  return cards.filter(c => c.collector_id === collectorId);
}

export function getCollectorDayStats(collectorId, cards, cardDays, products, users) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const cardsToday = cards.filter(c =>
    c.collector_id === collectorId &&
    c.activated_at &&
    c.activated_at.slice(0, 10) === todayStr
  );
  const cardsAmount = cardsToday.length * 200;

  const myCardIds = cards.filter(c => c.collector_id === collectorId).map(c => c.id);
  const misesToday = cardDays.filter(d =>
    myCardIds.includes(d.card_id) &&
    d.filled &&
    d.filled_at &&
    d.filled_at.slice(0, 10) === todayStr
  );
  const misesAmount = misesToday.reduce((sum, d) => sum + (d.amount || 0), 0);

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

  const inPeriod = iso => iso && new Date(iso) >= start;

  const myCards = cards.filter(c => c.collector_id === collectorId);
  const cardsSold = myCards.filter(c => inPeriod(c.activated_at) && c.card_fee_paid);
  const cardsAmount = cardsSold.length * 200;

  const myCardIds = myCards.map(c => c.id);
  const mises = cardDays.filter(d =>
    myCardIds.includes(d.card_id) && d.filled && inPeriod(d.filled_at)
  );
  const misesAmount = mises.reduce((sum, d) => sum + (d.amount || 0), 0);

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