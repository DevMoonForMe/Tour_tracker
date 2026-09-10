import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Users, ReceiptText, HandCoins, Settings as SettingsIcon, PiggyBank } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Trips', path: '/trips', icon: Map },
  { name: 'Expenses', path: '/expenses', icon: ReceiptText },
  { name: 'Advances', path: '/advances', icon: PiggyBank },
  { name: 'Members', path: '/members', icon: Users },
  { name: 'Settlement', path: '/settlement', icon: HandCoins },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-600 flex items-center gap-2">
          <Map className="w-6 h-6" />
          Tour Split
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={twMerge(
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors',
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 text-center">
        Tour Split Tracker &copy; 2026
      </div>
    </aside>
  );
}
