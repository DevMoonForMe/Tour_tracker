import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTripStore } from './store/useTripStore';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Trips } from './pages/Trips';
import { Members } from './pages/Members';
import { Expenses } from './pages/Expenses';
import { Settlement } from './pages/Settlement';
import { Settings } from './pages/Settings';
import { Advances } from './pages/Advances';

function App() {
  useEffect(() => {
    useTripStore.getState().fetchData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/trips" element={<MainLayout><Trips /></MainLayout>} />
        <Route path="/members" element={<MainLayout><Members /></MainLayout>} />
        <Route path="/expenses" element={<MainLayout><Expenses /></MainLayout>} />
        <Route path="/advances" element={<MainLayout><Advances /></MainLayout>} />
        <Route path="/settlement" element={<MainLayout><Settlement /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
