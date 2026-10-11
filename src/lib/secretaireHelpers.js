// ============================================================
// HELPERS SECRÉTAIRE
// ============================================================

// Statut d'un collecteur aujourd'hui
export function getCollectorStatusToday(collectorId, validations) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const yesterdayValidated = validations.some(
    v => v.collector_id === collectorId && v.date === yesterday
  );
  const todayValidated = validations.some(
    v => v.collector_id === collectorId && v.date === today
  );

  return {
    yesterdayValidated,
    todayValidated,
    label: todayValidated
      ? '✅ Journée validée'
      : '⏳ En attente de validation',
    color: todayValidated ? 'success' : 'warning',
  };
}

// Comptabilité journalière d'un collecteur pour une date donnée (défaut = aujourd'hui)
export function getDayAccounting(collectorId, dateStr, cards, cardDays, products, users) {
  const cardsOnDate = cards.filter(
    c =>
      c.collector_id === collectorId &&
      c.activated_at &&
      c.activated_at.slice(0, 10) === dateStr
  );

  // ---- Tableau 1 : Cartes vendues (frais 200 FCFA) ----
  const cardsRows = cardsOnDate
    .filter(c => c.card_fee_paid)
    .map(c => {
      const client = users.find(u => u.id === c.client_id);
      const product = products.find(p => p.id === c.product_id);
      return {
        id: c.id,
        client_number: client?.client_number || '—',
        client_name: client?.name || '—',
        product_photo: product?.photo_url || null,
        product_name: product?.name || '—',
        duration: product?.product_type === '1_an' ? '1 an'
                : product?.product_type === 'kit' ? 'Kit'
                : '1 mois',
        fee: 200,
      };
    });
  const cardsTotal = cardsRows.length * 200;

  // ---- Tableau 2 : Mises reçues ----
  const collectorCards = cards.filter(c => c.collector_id === collectorId);
  const collectorCardIds = collectorCards.map(c => c.id);

  const misesToday = cardDays.filter(
    d =>
      collectorCardIds.includes(d.card_id) &&
      d.filled &&
      d.filled_at &&
      d.filled_at.slice(0, 10) === dateStr
  );

  // Regroupe par (client, carte)
  const misesByKey = {};
  misesToday.forEach(d => {
    const card = collectorCards.find(c => c.id === d.card_id);
    if (!card) return;
    const key = `${card.client_id}__${card.id}`;
    if (!misesByKey[key]) {
      const client = users.find(u => u.id === card.client_id);
      const product = products.find(p => p.id === card.product_id);
      misesByKey[key] = {
        client_number: client?.client_number || '—',
        client_name: client?.name || '—',
        card_label: product?.name || '—',
        count: 0,
        total_paid: 0,
      };
    }
    misesByKey[key].count += 1;
    misesByKey[key].total_paid += d.amount || 0;
  });
  const misesRows = Object.values(misesByKey).map(r => ({
    ...r,
    card_display: `${r.card_label} (${r.count})`,
  }));
  const misesTotal = misesRows.reduce((sum, r) => sum + r.total_paid, 0);

  // ---- Tableau 3 : Livraisons (1 000 FCFA) ----
  const livraisonsRows = cardsOnDate
    .filter(c => c.delivery_fee_paid)
    .map(c => {
      const client = users.find(u => u.id === c.client_id);
      const product = products.find(p => p.id === c.product_id);
      return {
        id: c.id,
        client_number: client?.client_number || '—',
        client_name: client?.name || '—',
        product_name: product?.name || '—',
        amount: 1000,
      };
    });
  const livraisonsTotal = livraisonsRows.length * 1000;

  return {
    date: dateStr,
    cards: { rows: cardsRows, total: cardsTotal },
    mises: { rows: misesRows, total: misesTotal },
    livraisons: { rows: livraisonsRows, total: livraisonsTotal },
    grandTotal: cardsTotal + misesTotal + livraisonsTotal,
  };
}

// Stats globales secrétaire
export function getGlobalStats(users, cards, cardDays) {
  const collectors = users.filter(u => u.role === 'collecteur');
  const clients = users.filter(u => u.role === 'client');
  const clientsEnAttente = clients.filter(c => c.status === 'en_attente');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMises = cardDays.filter(
    d => d.filled && d.filled_at && d.filled_at.slice(0, 10) === todayStr
  );
  const totalToday = todayMises.reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    collectorsCount: collectors.length,
    clientsCount: clients.length,
    clientsEnAttenteCount: clientsEnAttente.length,
    totalToday,
  };
}