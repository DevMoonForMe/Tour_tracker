"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, ReceiptText, HandCoins, Users, PiggyBank } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'Dash', path: '/', icon: Home },
  { name: 'Trips', path: '/trips', icon: Map },
  { name: 'Expenses', path: '/expenses', icon: ReceiptText },
  { name: 'Advances', path: '/advances', icon: PiggyBank },
  { name: 'Members', path: '/members', icon: Users },
  { name: 'Settlement', path: '/settlement', icon: HandCoins },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={twMerge(
                clsx(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  isActive 
                    ? 'text-primary-600' 
                    : 'text-slate-500 hover:text-slate-900'
                )
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive && "fill-primary-50")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
