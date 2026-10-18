import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMockStore } from '../../lib/mockStore';
import { isCollectorBlocked } from '../../lib/collectorHelpers';
import BlockingBanner from './BlockingBanner';

export default function CollecteurLayout() {
  const { user } = useAuth();
  const store = useMockStore();

  const blockInfo = user
    ? isCollectorBlocked(user.id, store.cards, store.dailyValidations, store.cardDays)
    : { blocked: false };

  return (
    <>
      {blockInfo.blocked && (
        <div className="p-4 pb-0 max-w-lg mx-auto lg:max-w-6xl">
          <BlockingBanner reason={blockInfo.reason} type={blockInfo.type} />
        </div>
      )}
      <Outlet context={{ blocked: blockInfo.blocked }} />
    </>
  );
}