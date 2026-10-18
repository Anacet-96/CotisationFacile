import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DataProvider } from '../../context/DataContext';

export default function AppLayout() {
  return (
    <DataProvider>
      <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </DataProvider>
  );
}