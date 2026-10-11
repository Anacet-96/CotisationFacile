import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Phone, MapPin, Briefcase,
  Lock, Check, Plus, AlertCircle, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, fillCardDays, activateCard, addProfileChangeRequest, addNotification } from '../../lib/mockStore';
import { isCollectorBlocked } from '../../lib/collectorHelpers';
import { formatFCFA, cx, cardStatusLabel, getCardDaysForMonth } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Card31 from '../../components/ui/Card31';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ValiderMisesModal from '../../components/collecteur/ValiderMisesModal';
import ActiverCarteModal from '../../components/collecteur/ActiverCarteModal';

export default function ClientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  // ---------- Blocage ----------
  const blockInfo = user
    ? isCollectorBlocked(user.id, store.cards, store.dailyValidations)
    : { blocked: false };
  const blocked = blockInfo.blocked;

  // ---------- Client ----------
  const client = user
    ? store.users.find(u => u.id === id && u.collector_id === user.id) || null
    : null;

  // ---------- States locaux ----------
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDays, setPendingDays] = useState({}); // { [cardId]: Set<number> }
  const [validerModal, setValiderModal] = useState(null); // { card, count }
  const [activerModal, setActiverModal] = useState(null); // { card }
  const [toast, setToast] = useState(null);

  // ---------- Dérivés ----------
  const clientCards = useMemo(
    () => (id ? store.cards.filter(c => c.client_id === id) : []),
    [store.cards, id]
  );

  const pendingRequests = useMemo(
    () => (client
      ? store.profileChangeRequests.filter(
          r => r.client_id === client.id && r.status === 'en_attente'
        )
      : []),
    [client, store.profileChangeRequests]
  );

  // ---------- Client introuvable ----------
  if (!client) {
    return (
      <>
        <Header title="Client" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Link to="/collecteur" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Client introuvable ou non assigné.</p>
            <Link to="/collecteur" className="btn-primary inline-flex">
              Retour à mes clients
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ---------- Helpers ----------
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function toggleDay(cardId, dayNumber) {
    if (blocked) return;
    setPendingDays(prev => {
      const set = new Set(prev[cardId] || []);
      if (set.has(dayNumber)) set.delete(dayNumber);
      else set.add(dayNumber);
      return { ...prev, [cardId]: set };
    });
  }

  function openValider(card) {
    if (!card) return;
    const count = (pendingDays[card.id] || new Set()).size;
    if (count === 0) return;
    setValiderModal({ card, count });
  }

  // ---------- Validation des mises ----------
  function confirmValider() {
    if (!validerModal?.card) return;
    const { card, count } = validerModal;
    const selectedDays = Array.from(pendingDays[card.id] || []);
    const product = store.products.find(p => p.id === card.product_id);

    // TODO Supabase : UPDATE card_days SET filled=true, filled_at=now, filled_by=user.id
    //                WHERE card_id=card.id AND day_number IN (selectedDays)
    fillCardDays(card.id, selectedDays, user.id);

    // 1 notification PAR carte signée (règle métier : signer 2 cartes = 2 messages)
    addNotification({
      userId: client.id,
      type: 'mise_confirmee',
      message: `${product?.name} · Votre collecteur ${user.name} a confirmé ${count} mise${count > 1 ? 's' : ''} (${formatFCFA(count * card.locked_price_per_day)}).`,
      link: `/client/carte/${card.id}`,
    });

    setPendingDays(prev => ({ ...prev, [card.id]: new Set() }));
    setValiderModal(null);
    showToast(`✅ ${count} mise${count > 1 ? 's' : ''} validée${count > 1 ? 's' : ''} pour ${client.name}`);
  }

  // ---------- Activation carte ----------
  function confirmActiver() {
    if (!activerModal?.card) return;
    const card = activerModal.card;
    const product = store.products.find(p => p.id === card.product_id);

    // TODO Supabase : UPDATE cards + INSERT card_fees + INSERT notifications
    activateCard(card.id, user.id);

    addNotification({
      userId: client.id,
      type: 'adhesion_validee',
      message: `Votre adhésion pour ${product?.name} a été validée. Bonne cotisation !`,
      link: `/client/carte/${card.id}`,
    });

    setActiverModal(null);
    showToast('✅ Carte activée. Frais 200 FCFA enregistrés.');
  }

  // ---------- Rendu ----------
  return (
    <>
      <Header title={client.name} />

      {/* Toast feedback */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 text-sm text-muted"
        >
          <ArrowLeft size={16} /> Retour
        </button>

        {/* ---------- Infos client ---------- */}
        <div className="card">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="font-heading font-bold text-lg truncate">{client.name}</h2>
                <Badge color="primary" className="font-mono shrink-0">
                  {client.client_number}
                </Badge>
              </div>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="shrink-0 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              title="Modifier les informations"
            >
              <Pencil size={18} className="text-primary-light dark:text-primary-dark" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow icon={Phone} label="Téléphone" value={client.phone} />
            <InfoRow icon={MapPin} label="Ville" value={client.city} />
            <InfoRow icon={MapPin} label="Quartier" value={client.district} />
            <InfoRow icon={Briefcase} label="Profession" value={client.profession || '—'} />
          </div>

          {pendingRequests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-outline/30">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                <Clock size={14} /> {pendingRequests.length} modification(s) en attente d'approbation
              </p>
              {pendingRequests.map(r => (
                <div key={r.id} className="text-xs text-muted flex items-center gap-2">
                  <span className="capitalize font-semibold">{r.field_name}</span>
                  <span>{r.old_value || '—'}</span>
                  <span>→</span>
                  <span className="font-semibold text-content-light dark:text-content-dark">
                    {r.new_value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------- Cartes ---------- */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg">
            Ses cartes <span className="text-muted font-normal text-sm">({clientCards.length})</span>
          </h3>
          <Link
            to={`/collecteur/nouvelle-carte/${client.id}`}
            className={cx(
              'text-sm font-semibold flex items-center gap-1 text-primary-light dark:text-primary-dark px-3 py-2 rounded-lg hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 min-h-[40px]',
              blocked && 'opacity-50 pointer-events-none'
            )}
          >
            <Plus size={16} /> Nouvelle carte
          </Link>
        </div>

        {clientCards.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-muted text-sm mb-3">Aucune carte pour ce client.</p>
            <Link
              to={`/collecteur/nouvelle-carte/${client.id}`}
              className={cx('btn-primary inline-flex', blocked && 'opacity-50 pointer-events-none')}
            >
              <Plus size={16} /> Ouvrir une carte
            </Link>
          </div>
        )}

        {/* Grille — 1 / 2 / 3 colonnes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientCards.map(card => (
            <EditableCard
              key={card.id}
              card={card}
              allDays={store.cardDays}
              blocked={blocked}
              pending={pendingDays[card.id] || new Set()}
              onToggle={day => toggleDay(card.id, day)}
              onValider={() => openValider(card)}
              onActiver={() => setActiverModal({ card })}
            />
          ))}
        </div>
      </div>

      {/* ---------- Modal édition infos client ---------- */}
      <EditClientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
        onSave={() => {
          // TODO Supabase : INSERT profile_change_requests
          addProfileChangeRequest({
            collector_id: user.id,
            client_id: client.id,
            field_name: 'profile',
            old_value: null,
            new_value: 'modification',
          });

          // Notif à l'admin (tous les admins)
          const admins = store.users.filter(u => u.role === 'admin');
          admins.forEach(admin => {
            addNotification({
              userId: admin.id,
              type: 'modification_client_demandee',
              message: `${user.name} propose une modification du profil de ${client.name}. En attente d'approbation.`,
              link: '/admin',
            });
          });

          setEditOpen(false);
          showToast("📤 Modification envoyée pour approbation à l'admin.");
        }}
      />

      {/* ---------- Modal validation mises ---------- */}
      {validerModal && validerModal.card && (
        <ValiderMisesModal
          open
          onClose={() => setValiderModal(null)}
          onConfirm={confirmValider}
          client={client}
          product={store.products.find(p => p.id === validerModal.card.product_id)}
          count={validerModal.count}
          pricePerDay={validerModal.card.locked_price_per_day}
        />
      )}

      {/* ---------- Modal activation carte ---------- */}
      {activerModal && activerModal.card && (
        <ActiverCarteModal
          open
          onClose={() => setActiverModal(null)}
          onConfirm={confirmActiver}
          client={client}
        />
      )}
    </>
  );
}

// ============================================================
// Composant : ligne d'info
// ============================================================
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// Composant : carte éditable (avec grille 31 cliquable)
// ============================================================
function EditableCard({ card, allDays, blocked, pending, onToggle, onValider, onActiver }) {
  // ⚠️ Hooks DOIVENT être appelés avant tout return conditionnel.
  // On ne peut pas utiliser useMockStore ici car EditableCard reçoit déjà tout par props.
  const product = allDays && card
    ? null // évitons d'appeler un hook ici
    : null;
  void product;

  // Reprend le product depuis un contexte implicite — ici on utilise le store via un hook safe :
  // On utilise plutôt les props reçues : le parent nous donne "allDays" déjà enrichi.
  // Le product est récupéré via un useMockStore (acceptable car le composant est toujours rendu).
  const store = useMockStore();
  const prod = store.products.find(p => p.id === card.product_id);
  const isYear = prod?.product_type === '1_an';
  const currentMonth = card.current_month || 1;

  const days = getCardDaysForMonth(card, allDays, currentMonth, isYear);
  const pendingCount = pending.size;
  const filledCount = days.filter(d => d.filled).length;
  const finalCount = filledCount + pendingCount;
  const percent = Math.round((finalCount / days.length) * 100);

  // ---------- Carte en attente d'activation ----------
  if (card.status === 'en_attente') {
    return (
      <div className="card flex flex-col gap-3 border-2 border-amber-500/30">
        <div>
          <Badge color="warning">En attente d'activation</Badge>
        </div>
        <div>
          <h4 className="font-heading font-bold truncate">{prod?.name}</h4>
          <p className="text-xs text-muted mt-0.5">
            Mise : <span className="font-mono">{formatFCFA(card.locked_price_per_day)}</span> / jour
          </p>
        </div>
        <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-xs text-muted">
          Le client n'a pas encore payé les frais de carte (200 FCFA). Activez la carte dès réception.
        </div>
        <Button
          className="w-full"
          disabled={blocked}
          onClick={onActiver}
          title={blocked ? 'Journée précédente non validée' : ''}
        >
          <Check size={16} /> Activer la carte
        </Button>
      </div>
    );
  }

  // ---------- Carte active ou terminée ----------
  const isTermine = card.status === 'termine';

  return (
    <div className={cx('card flex flex-col gap-3', isTermine && 'opacity-70')}>
      <div className="flex items-start justify-between gap-2">
        <Badge color={isTermine ? 'neutral' : 'success'}>
          {cardStatusLabel(card.status)}
        </Badge>
        <span className="text-[10px] text-muted font-mono">
          {finalCount}/{days.length}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading font-bold truncate">{prod?.name}</h4>
          {isYear && (
            <span className="text-[10px] font-mono text-muted shrink-0">
              M{currentMonth}/{card.total_months || 12}
            </span>
          )}
        </div>
        <p className="text-xs text-muted mt-0.5">
          <span className="font-mono">{formatFCFA(card.locked_price_per_day)}</span> / jour
        </p>
      </div>

      <Card31
        days={days}
        readOnly={blocked || isTermine}
        compact
        pendingDays={pending}
        onToggle={blocked || isTermine ? null : onToggle}
      />

      {pendingCount > 0 && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
          <AlertCircle size={12} /> {pendingCount} jour(s) en attente de validation
        </p>
      )}

      <ProgressBar value={percent} />

      <Button
        className="w-full text-sm"
        disabled={blocked || pendingCount === 0}
        onClick={onValider}
        title={blocked ? 'Journée précédente non validée' : ''}
      >
        <Check size={16} /> Valider les mises {pendingCount > 0 && `(${pendingCount})`}
      </Button>
    </div>
  );
}

// ============================================================
// Modal : édition informations client
// ============================================================
function EditClientModal({ open, onClose, client, onSave }) {
  const [form, setForm] = useState({
    firstname: (client?.name || '').split(' ')[0] || '',
    lastname: (client?.name || '').split(' ').slice(1).join(' ') || '',
    phone: client?.phone || '',
    city: client?.city || '',
    district: client?.district || '',
    profession: client?.profession || '',
  });
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Modifier les informations"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={onSave}>Envoyer pour approbation</Button>
        </>
      }
    >
      <p className="text-xs text-muted mb-4">
        Toute modification sera <b>envoyée à l'administrateur</b> pour approbation.
        Les anciennes valeurs restent affichées jusque-là.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted">Prénom</label>
            <input className="input mt-1" value={form.firstname} onChange={e => set('firstname', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Nom</label>
            <input className="input mt-1" value={form.lastname} onChange={e => set('lastname', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Téléphone</label>
          <input className="input mt-1" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Ville</label>
          <input className="input mt-1" value={form.city} onChange={e => set('city', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Quartier</label>
          <input className="input mt-1" value={form.district} onChange={e => set('district', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Profession</label>
          <input className="input mt-1" value={form.profession} onChange={e => set('profession', e.target.value)} />
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <Lock size={14} className="shrink-0 mt-0.5" />
        Le mot de passe du client ne peut pas être modifié.
      </div>
    </Modal>
  );
}