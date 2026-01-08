import { Outlet } from 'react-router-dom';
import AppBar from '../components/AppBar';

function ParametreLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <AppBar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default ParametreLayout;