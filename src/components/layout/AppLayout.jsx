import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}