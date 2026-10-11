// ============================================================
// HELPERS ADMIN
// ============================================================

// Stats globales admin
export function getGlobalAdminStats(users, cards, cardDays, products) {
  const collectors = users.filter(u => u.role === 'collecteur');
  const clients = users.filter(u => u.role === 'client');
  const totalMises = cardDays
    .filter(d => d.filled)
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    collectorsCount: collectors.length,
    clientsCount: clients.length,
    productsActiveCount: products.filter(p => p.is_active).length,
    totalCollected: totalMises,
  };
}

// Performance par collecteur sur une période
export function getAdminCollectorStats(collectorId, period, cards, cardDays, products) {
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
  const myCardIds = myCards.map(c => c.id);

  const cardsSold = myCards.filter(c => inPeriod(c.activated_at) && c.card_fee_paid);
  const mises = cardDays.filter(
    d => myCardIds.includes(d.card_id) && d.filled && inPeriod(d.filled_at)
  );
  const deliveries = myCards.filter(c => {
    if (!inPeriod(c.activated_at) || !c.delivery_fee_paid) return false;
    const p = products.find(pp => pp.id === c.product_id);
    return p && (p.product_type === '1_mois' || p.product_type === 'kit');
  });

  const cardsAmount = cardsSold.length * 200;
  const misesAmount = mises.reduce((sum, d) => sum + (d.amount || 0), 0);
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

// Évolution du total collecté par jour sur les N derniers jours
export function getCollectedEvolution(cardDays, days = 14) {
  const result = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const total = cardDays
      .filter(cd => cd.filled && cd.filled_at && cd.filled_at.slice(0, 10) === key)
      .reduce((sum, cd) => sum + (cd.amount || 0), 0);
    result.push({
      date: key,
      label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      total,
    });
  }
  return result;
}

// Nouveaux clients + nouvelles cartes par période
export function getGrowthStats(users, cards, period) {
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

  const newClients = users.filter(
    u => u.role === 'client' && inPeriod(u.created_at)
  ).length;

  const newCards = cards.filter(c => inPeriod(c.created_at || c.activated_at)).length;

  return { newClients, newCards };
}