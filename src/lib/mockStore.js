
// ============================================================
// mockStore — Alias de compatibilité vers Supabase
// ============================================================

export { useData as useMockStore } from '../context/DataContext';

export {
  // Cartes
  addCard, activateCard, fillCardDays, deleteCard, closeCardMonth,
  // Notifications
  addNotification, markNotificationRead, markAllRead,
  // Secrétaire
  validateDay, approveClientRegistration, rejectClientRegistration,
  assignCollectorToClient, changeUserRole,
  // Admin - Produits & Kits
  addProduct, updateProduct, toggleProductActive,
  addKitItem, updateKitItem, toggleKitItemActive,
  // Admin - Commandes & Modifs
  updateCustomOrder, addProfileChangeRequest, reviewProfileChangeRequest,
} from './api';