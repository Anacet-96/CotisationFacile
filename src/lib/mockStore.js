// ============================================================
// mockStore — Alias de compatibilité vers Supabase
// Le nom reste pour ne pas casser les imports existants.
// ============================================================

export { useData as useMockStore } from '../context/DataContext';

export {
  addCard, activateCard, fillCardDays,
  addNotification, markNotificationRead, markAllRead,
  validateDay, approveClientRegistration, rejectClientRegistration,
  assignCollectorToClient, changeUserRole,
  addProduct, updateProduct, toggleProductActive,
  addKitItem, updateKitItem, toggleKitItemActive,
  updateCustomOrder, addProfileChangeRequest, reviewProfileChangeRequest,
} from './api';