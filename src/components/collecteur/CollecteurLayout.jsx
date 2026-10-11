import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockCards, mockDailyValidations } from '../../lib/mockData';
import { isCollectorBlocked } from '../../lib/collectorHelpers';
import BlockingBanner from './BlockingBanner';

export default function CollecteurLayout() {
  const { user } = useAuth();
  const { blocked, reason } = isCollectorBlocked(user?.id, mockCards, mockDailyValidations);

  return (
    <>
      {blocked && (
        <div className="p-4 pb-0 max-w-lg mx-auto lg:max-w-6xl">
          <BlockingBanner reason={reason} />
        </div>
      )}
      <Outlet context={{ blocked }} />
    </>
  );
}