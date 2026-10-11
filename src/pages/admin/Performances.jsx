import { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp, Users, CreditCard, ArrowRight  } from 'lucide-react';
import { useMockStore } from '../../lib/mockStore';
import { getAdminCollectorStats, getCollectedEvolution, getGrowthStats } from '../../lib/adminHelpers';
import { formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
// import { ..., ArrowRight } from 'lucide-react';

const FILTRES = [
  { key: 'jour', label: "Aujourd'hui" },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois', label: 'Ce mois' },
  { key: 'annee', label: 'Année' },
];

const COLORS = ['#421cc8', '#1f6b45', '#f59e0b'];

export default function Performances() {
  const store = useMockStore();
  const [filtre, setFiltre] = useState('mois');

  const collectors = store.users.filter(u => u.role === 'collecteur');
  const growth = getGrowthStats(store.users, store.cards, filtre);
  const evolution = getCollectedEvolution(store.cardDays, 14);

  const globalStats = collectors.reduce(
    (acc, c) => {
      const s = getAdminCollectorStats(c.id, filtre, store.cards, store.cardDays, store.products);
      return {
        cardsCount: acc.cardsCount + s.cardsCount,
        cardsAmount: acc.cardsAmount + s.cardsAmount,
        misesCount: acc.misesCount + s.misesCount,
        misesAmount: acc.misesAmount + s.misesAmount,
        deliveriesCount: acc.deliveriesCount + s.deliveriesCount,
        deliveriesAmount: acc.deliveriesAmount + s.deliveriesAmount,
        total: acc.total + s.total,
      };
    },
    { cardsCount: 0, cardsAmount: 0, misesCount: 0, misesAmount: 0, deliveriesCount: 0, deliveriesAmount: 0, total: 0 }
  );

  const pieData = [
    { name: 'Cartes vendues', value: globalStats.cardsAmount },
    { name: 'Mises collectées', value: globalStats.misesAmount },
    { name: 'Livraisons', value: globalStats.deliveriesAmount },
  ];

  return (
    <>
      <Header title="Performances globales" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {FILTRES.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={cx(
                'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px]',
                filtre === f.key
                  ? 'bg-primary-light dark:bg-primary-dark text-white'
                  : 'bg-black/5 dark:bg-white/10 text-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats de croissance */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={CreditCard} label="Cartes vendues" value={globalStats.cardsCount} amount={globalStats.cardsAmount} />
          <MiniStat icon={TrendingUp} label="Mises" value={globalStats.misesCount} amount={globalStats.misesAmount} />
          <MiniStat icon={Users} label="Nouveaux clients" value={growth.newClients} />
          <MiniStat icon={CreditCard} label="Nouvelles cartes" value={growth.newCards} />
        </div>

        {/* Total général */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Total encaissé sur la période
          </p>
          <p className="font-mono font-extrabold text-3xl mt-1">
            {formatFCFA(globalStats.total)}
          </p>
        </div>

        {/* Camembert */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-primary-light dark:text-primary-dark" />
            <h3 className="font-heading font-bold">Répartition</h3>
          </div>

          {globalStats.total === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-sm">Aucune activité sur cette période.</p>
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={v => formatFCFA(v)}
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                      <span>{d.name}</span>
                    </div>
                    <span className="font-mono font-semibold">{formatFCFA(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Courbe d'évolution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-primary-light dark:text-primary-dark" />
            <h3 className="font-heading font-bold">Évolution 14 derniers jours</h3>
          </div>

          <div className="h-56 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,117,135,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#787587' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#787587' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  tickFormatter={v => `${v > 999 ? `${Math.round(v / 1000)}k` : v}`}
                />
                <Tooltip
                  formatter={v => formatFCFA(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#421cc8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#421cc8' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau par collecteur */}

        <div>
          <h3 className="font-heading font-bold text-lg mb-3">Détail par collecteur</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collectors.map(c => {
              const s = getAdminCollectorStats(c.id, filtre, store.cards, store.cardDays, store.products);
              return (
                <Link
                  key={c.id}
                  to={`/admin/collecteur/${c.id}`}
                  className="card hover:shadow-md transition flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading font-bold truncate">{c.name}</p>
                      <p className="text-xs text-muted font-mono">{c.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge color="primary">{formatFCFA(s.total).replace(' FCFA', '')}</Badge>
                      <ArrowRight size={16} className="text-muted" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted">Cartes</p>
                      <p className="font-mono font-bold">{s.cardsCount}</p>
                    </div>
                    <div>
                      <p className="text-muted">Mises</p>
                      <p className="font-mono font-bold">{s.misesCount}</p>
                    </div>
                    <div>
                      <p className="text-muted">Livraisons</p>
                      <p className="font-mono font-bold">{s.deliveriesCount}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ icon: Icon, label, value, amount }) {
  return (
    <div className="card p-3">
      <Icon size={16} className="text-primary-light dark:text-primary-dark mb-2" />
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 truncate">
        {label}
      </p>
      <p className="font-mono font-extrabold text-xl leading-none">{value}</p>
      {amount !== undefined && (
        <p className="text-[10px] text-muted mt-1 font-mono">{formatFCFA(amount)}</p>
      )}
    </div>
  );
}