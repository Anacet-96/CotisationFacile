// ============================================================
// MOCK DATA — Emilio Transports
// Toutes les données de test pour naviguer sans Supabase
// TODO Supabase : supprimer ce fichier une fois connecté
// ============================================================

export const mockUsers = [
  {
    id: 'u-admin',
    email: 'admin@test.com',
    password: 'admin',
    name: 'Awa Diop',
    phone: '+229 97 00 00 01',
    role: 'admin',
    client_number: null,
    city: 'Cotonou',
    district: 'Haie Vive',
    profession: null,
  },
  {
    id: 'u-secretaire',
    email: 'secretaire@test.com',
    password: 'secretaire',
    name: 'Fati Ibrahim',
    phone: '+229 97 00 00 02',
    role: 'secretaire',
    client_number: null,
    city: 'Cotonou',
    district: 'Cadjehoun',
    profession: null,
  },
  {
    id: 'u-col-1',
    email: 'collecteur@test.com',
    password: 'collecteur',
    name: 'Koffi Mensah',
    phone: '+229 97 00 00 03',
    role: 'collecteur',
    client_number: null,
    city: 'Cotonou',
    district: 'Akpakpa',
    profession: null,
  },
  {
    id: 'u-col-2',
    email: 'collecteur2@test.com',
    password: 'collecteur',
    name: 'Rachid Bello',
    phone: '+229 97 00 00 04',
    role: 'collecteur',
    client_number: null,
    city: 'Cotonou',
    district: 'Fidjrossè',
    profession: null,
  },
  {
    id: 'u-cli-1',
    email: 'client@test.com',
    password: 'client',
    name: 'Grâce Houngbo',
    phone: '+229 97 11 11 11',
    role: 'client',
    client_number: 'CT-00001',
    city: 'Cotonou',
    district: 'Akpakpa',
    profession: 'Commerçante',
    collector_id: 'u-col-1',
  },
  {
    id: 'u-cli-2',
    email: 'client2@test.com',
    password: 'client',
    name: 'Moussa Traoré',
    phone: '+229 97 22 22 22',
    role: 'client',
    client_number: 'CT-00002',
    city: 'Cotonou',
    district: 'Akpakpa',
    profession: 'Chauffeur',
    collector_id: 'u-col-1',
  },
  {
    id: 'u-cli-3',
    email: 'client3@test.com',
    password: 'client',
    name: 'Alice Adjovi',
    phone: '+229 97 33 33 33',
    role: 'client',
    client_number: 'CT-00003',
    city: 'Cotonou',
    district: 'Fidjrossè',
    profession: 'Couturière',
    collector_id: 'u-col-2',
  },
  {
    id: 'u-cli-4',
    email: 'client4@test.com',
    password: 'client',
    name: 'Ibrahim Sanni',
    phone: '+229 97 44 44 44',
    role: 'client',
    client_number: 'CT-00004',
    city: 'Cotonou',
    district: 'Fidjrossè',
    profession: null,
    collector_id: 'u-col-2',
  },

   {
    id: 'u-cli-5',
    email: 'nouveau1@test.com',
    password: 'client',
    name: 'Béatrice Ahouandjinou',
    phone: '+229 97 55 55 55',
    role: 'client',
    client_number: 'CT-00005',
    city: 'Cotonou',
    district: 'Akpakpa',
    profession: 'Vendeuse',
    collector_id: null,
    status: 'en_attente', // ← nouveau, en attente de validation
  },
  {
    id: 'u-cli-6',
    email: 'nouveau2@test.com',
    password: 'client',
    name: 'Cédric Zinsou',
    phone: '+229 97 66 66 66',
    role: 'client',
    client_number: 'CT-00006',
    city: 'Cotonou',
    district: 'Fidjrossè',
    profession: null,
    collector_id: null,
    status: 'en_attente',
  },
  {
    id: 'u-col-promo',
    email: 'promo@test.com',
    password: 'promo',
    name: 'Sophie Kponou',
    phone: '+229 97 77 77 77',
    role: 'client', // à promouvoir collecteur par la secrétaire
    client_number: 'CT-00007',
    city: 'Cotonou',
    district: 'Cadjehoun',
    profession: 'Commerçante',
    collector_id: 'u-col-1',
  },
];

export const mockProducts = [
  {
    id: 'p-1',
    name: 'Moto 150cc',
    description: 'Moto robuste idéale pour le transport urbain.',
    price_per_day: 500,
    duration_days: 31,
    product_type: '1_mois',
    is_active: true,
    photo_url: null,
  },
  {
    id: 'p-2',
    name: 'Réfrigérateur',
    description: 'Réfrigérateur 200L pour conserver vos aliments.',
    price_per_day: 300,
    duration_days: 31,
    product_type: '1_mois',
    is_active: true,
    photo_url: null,
  },
  {
    id: 'p-3',
    name: 'Télévision',
    description: 'TV LED 32 pouces.',
    price_per_day: 200,
    duration_days: 31,
    product_type: '1_mois',
    is_active: true,
    photo_url: null,
  },
  {
    id: 'p-4',
    name: 'Kit Riz 25kg',
    description: 'Kit alimentaire — 12 mois.',
    price_per_day: 400,
    duration_days: 372,
    product_type: '1_an',
    is_active: true,
    photo_url: null,
  },
  {
    id: 'p-5',
    name: 'Kit Ravitaillement',
    description: 'Composez votre kit à la carte.',
    price_per_day: 0,
    duration_days: 31,
    product_type: 'kit',
    is_active: true,
    photo_url: null,
  },
];

export const mockKitItems = [
  { id: 'ki-1', name: 'Riz 25kg', price: 15000, is_active: true, photo_url: null, kit_ids: ['p-5'] },
  { id: 'ki-2', name: 'Huile 5L', price: 6000, is_active: true, photo_url: null, kit_ids: ['p-5'] },
  { id: 'ki-3', name: 'Sucre 10kg', price: 5000, is_active: true, photo_url: null, kit_ids: ['p-5'] },
  { id: 'ki-4', name: 'Lait en poudre', price: 4500, is_active: true, photo_url: null, kit_ids: ['p-5'] },
  { id: 'ki-5', name: 'Savon (x12)', price: 3000, is_active: true, photo_url: null, kit_ids: ['p-5'] },
];

// Cartes — statuts variés
export const mockCards = [
  {
    id: 'c-1',
    client_id: 'u-cli-1',
    product_id: 'p-1',
    collector_id: 'u-col-1',
    status: 'actif',
    period_label: 'Mois 1',
    activated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    activated_by: 'u-col-1',
    locked_price_per_day: 500,
    card_fee_paid: true,
    delivery_fee_paid: true,
  },
  {
    id: 'c-2',
    client_id: 'u-cli-2',
    product_id: 'p-2',
    collector_id: 'u-col-1',
    status: 'en_attente',
    period_label: 'Mois 1',
    activated_at: null,
    activated_by: null,
    locked_price_per_day: 300,
    card_fee_paid: false,
    delivery_fee_paid: false,
  },
  {
    id: 'c-3',
    client_id: 'u-cli-3',
    product_id: 'p-3',
    collector_id: 'u-col-2',
    status: 'actif',
    period_label: 'Mois 1',
    activated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    activated_by: 'u-col-2',
    locked_price_per_day: 200,
    card_fee_paid: true,
    delivery_fee_paid: true,
  },
  // ⭐ Carte 1 AN (client 1, Kit Riz 25kg)
  {
    id: 'c-4',
    client_id: 'u-cli-1',
    product_id: 'p-4',
    collector_id: 'u-col-1',
    status: 'actif',
    period_label: 'Mois 2 / 12',
    activated_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    activated_by: 'u-col-1',
    locked_price_per_day: 400,
    card_fee_paid: true,
    delivery_fee_paid: true,
    // Champs spécifiques 1 an
    current_month: 2,
    total_months: 12,
    months_completed: 1,
  },
];

// Jours de carte — réaliste : carte 1 a 12 jours cochés
// Jours de carte — avec variations temporelles réalistes
export const mockCardDays = (() => {
  const days = [];
  let id = 1;
  const now = Date.now();
  const DAY = 86400000;

  // Carte 1 (client 1, Moto 150cc) : 14 jours cochés, dernier aujourd'hui
  for (let d = 1; d <= 31; d++) {
    const filled = d <= 14;
    days.push({
      id: `cd-${id++}`,
      card_id: 'c-1',
      day_number: d,
      filled,
      filled_at: filled ? new Date(now - (14 - d) * DAY).toISOString() : null,
      filled_by: filled ? 'u-col-1' : null,
      amount: filled ? 500 : 0,
      is_locked: d <= 12,
      was_modified: d === 6, // jour 6 marqué comme "modifié par le collecteur"
    });
  }
  // Carte 3 (client 3, Télévision) : 5 jours cochés
  for (let d = 1; d <= 31; d++) {
    const filled = d <= 5;
    days.push({
      id: `cd-${id++}`,
      card_id: 'c-3',
      day_number: d,
      filled,
      filled_at: filled ? new Date(now - (5 - d) * DAY).toISOString() : null,
      filled_by: filled ? 'u-col-2' : null,
      amount: filled ? 200 : 0,
      is_locked: false,
      was_modified: false,
    });
  }
  // Carte 2 (client 2, en attente) : rien
  for (let d = 1; d <= 31; d++) {
    days.push({
      id: `cd-${id++}`,
      card_id: 'c-2',
      day_number: d,
      filled: false,
      filled_at: null,
      filled_by: null,
      amount: 0,
      is_locked: false,
      was_modified: false,
    });
  }

    // Carte 4 (1 an) — mois 2 en cours, 14 jours cochés
  for (let d = 1; d <= 31; d++) {
    const filled = d <= 14;
    days.push({
      id: `cd-${id++}`,
      card_id: 'c-4',
      day_number: d,
      filled,
      filled_at: filled ? new Date(now - (14 - d) * DAY).toISOString() : null,
      filled_by: filled ? 'u-col-1' : null,
      amount: filled ? 400 : 0,
      is_locked: d <= 12,
      was_modified: false,
    });
  }
  return days;
})();

export const mockNotifications = [
  {
    id: 'n-1',
    user_id: 'u-cli-1',
    type: 'mise_confirmee',
    message: 'Moto 150cc · Koffi Mensah a confirmé votre mise du jour #14 (500 FCFA).',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    link: '/client/carte/c-1',
  },
  {
    id: 'n-2',
    user_id: 'u-cli-1',
    type: 'mise_confirmee',
    message: 'Kit Riz 25kg · Koffi Mensah a confirmé votre mise du jour #14 (400 FCFA).',
    read: false,
    created_at: new Date(Date.now() - 3500000).toISOString(),
    link: '/client/carte/c-4',
  },
  {
    id: 'n-3',
    user_id: 'u-cli-1',
    type: 'modification_mise',
    message: 'Attention : une mise déjà enregistrée sur Moto 150cc (Jour #6) a été modifiée par votre collecteur.',
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    link: '/client/historique',
  },
  {
    id: 'n-4',
    user_id: 'u-cli-1',
    type: 'adhesion_validee',
    message: 'Votre adhésion pour Kit Riz 25kg a été validée. Bonne cotisation !',
    read: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    link: '/client/carte/c-4',
  },
  {
    id: 'n-5',
    user_id: 'u-col-1',
    type: 'journee_validee',
    message: 'Journée du mois dernier validée par la secrétaire. Vous pouvez reprendre votre activité.',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    link: '/collecteur',
  },
];

export const mockDailyValidations = [
  {
    id: 'dv-1',
    collector_id: 'u-col-1',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    validated_by: 'u-secretaire',
    validated_at: new Date(Date.now() - 80000000).toISOString(),
    total_amount: 6500,
    locked: true,
  },
];

export const mockCustomOrders = [
  {
    id: 'co-1',
    client_id: 'u-cli-1',
    description: 'Je voudrais un congélateur 150L',
    estimated_price: 180000,
    status: 'en_attente',
    admin_response: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockProfileChangeRequests = [
  {
    id: 'pcr-1',
    collector_id: 'u-col-1',
    client_id: 'u-cli-1',
    field_name: 'phone',
    old_value: '+229 97 11 11 11',
    new_value: '+229 97 11 11 99',
    status: 'en_attente',
    admin_note: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'pcr-2',
    collector_id: 'u-col-1',
    client_id: 'u-cli-2',
    field_name: 'profession',
    old_value: null,
    new_value: 'Chauffeur VTC',
    status: 'en_attente',
    admin_note: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];