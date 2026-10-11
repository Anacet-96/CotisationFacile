import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCards, mockCardDays, mockProducts } from '../../lib/mockData';
import { formatFCFA, cx } from '../../lib/helpers';
import { getCollectorStats } from '../../lib/collectorHelpers';
import Header from '../../components/layout/Header';

const FILTRES = [
  { key: 'jour', label: "Aujourd'hui" },
  { key: 'semaine', label: 'Cette semaine' },
  { key: 'mois', label: 'Ce mois' },
  { key: 'annee', label: 'Cette année' },
];

const COLORS = ['#421cc8', '#1f6b45', '#f59e0b'];

export default function Performances() {
  const { user } = useAuth();
  const [filtre, setFiltre] = useState('mois');

  const stats = getCollectorStats(user.id, filtre, mockCards, mockCardDays, mockProducts);

  const data = [
    { name: 'Cartes vendues', value: stats.cardsAmount, count: stats.cardsCount, unit: '200 FCFA × ' + stats.cardsCount },
    { name: 'Mises collectées', value: stats.misesAmount, count: stats.misesCount, unit: stats.misesCount + ' mises' },
    { name: 'Livraisons', value: stats.deliveriesAmount, count: stats.deliveriesCount, unit: '1 000 FCFA × ' + stats.deliveriesCount },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <Header title="Mes performances" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-4xl space-y-4">

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

        {/* Camembert */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-primary-light dark:text-primary-dark" />
            <h3 className="font-heading font-bold">Répartition</h3>
          </div>

          {total === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-sm">Aucune activité sur cette période.</p>
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatFCFA(v)}
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

              {/* Légende */}
              <div className="space-y-2 mt-2">
                {data.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                      <span>{d.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold">{formatFCFA(d.value)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-outline/30 flex items-center justify-between">
                <span className="font-semibold">Total encaissé</span>
                <span className="font-mono font-extrabold text-lg text-primary-light dark:text-primary-dark">
                  {formatFCFA(total)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Chiffres */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Cartes vendues" value={stats.cardsCount} amount={stats.cardsAmount} />
          <MiniStat label="Mises" value={stats.misesCount} amount={stats.misesAmount} />
          <MiniStat label="Livraisons" value={stats.deliveriesCount} amount={stats.deliveriesAmount} />
          <MiniStat label="Total" value="—" amount={total} highlight />
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, amount, highlight }) {
  return (
    <div className={cx('card p-3', highlight && 'border-2 border-primary-light/40 dark:border-primary-dark/40')}>
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 truncate">
        {label}
      </p>
      <p className="font-mono font-extrabold text-xl leading-none">{value}</p>
      <p className="text-[10px] text-muted mt-1 font-mono">{formatFCFA(amount)}</p>
    </div>
  );
}