"use client";

import { useMemo, useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { calculateBalances, calculateSettlements, formatCurrency } from '@/utils/calculations';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Users, ArrowRight, CheckCircle2, HandCoins } from 'lucide-react';
import Link from 'next/link';
import { MemberDetailsModal } from '@/components/MemberDetailsModal';

export default function DashboardPage() {
  const { activeTripId, trips, members, expenses, contributions } = useTripStore();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const activeTrip = trips.find(t => t.id === activeTripId);

  const tripMembers = useMemo(() => members.filter(m => m.tripId === activeTripId), [members, activeTripId]);
  const tripExpenses = useMemo(() => expenses.filter(e => e.tripId === activeTripId), [expenses, activeTripId]);
  const tripContributions = useMemo(() => contributions.filter(c => c.tripId === activeTripId), [contributions, activeTripId]);

  const totalBudget = activeTrip?.budget || 0;
  
  const totalExpenses = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalContributions = tripContributions.reduce((sum, c) => sum + c.amount, 0);
  const remainingBudget = totalBudget > 0 ? totalBudget - totalExpenses : 0;

  const balances = useMemo(() => {
    return calculateBalances(tripMembers, tripExpenses, tripContributions);
  }, [tripMembers, tripExpenses, tripContributions]);

  const settlements = useMemo(() => {
    return calculateSettlements(balances);
  }, [balances]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        {activeTrip ? (
          <p className="text-slate-500">Overview for {activeTrip.name}</p>
        ) : (
          <p className="text-slate-500">No active trip selected.</p>
        )}
      </header>

      {!activeTrip ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <h2 className="text-lg font-medium text-slate-700 mb-2">Welcome to Tour Split Tracker</h2>
          <p className="text-slate-500 mb-4">Get started by creating your first trip.</p>
          <Link href="/trips" className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Go to Trips
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Budget</h3>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</h3>
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Remaining</h3>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(remainingBudget)}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Contributions</h3>
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <PiggyBank className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalContributions)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  Member Summary
                </h2>
                <Link href="/members" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
              </div>
              
              {balances.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No members added yet.</p>
              ) : (
                <div className="space-y-4">
                  {balances.map(b => {
                    const member = tripMembers.find(m => m.id === b.memberId);
                    if (!member) return null;
                    return (
                      <div 
                        key={b.memberId} 
                        onClick={() => setSelectedMemberId(b.memberId)}
                        className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors"
                      >
                        <span className="font-medium text-slate-700">{member.name}</span>
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${
                            b.netBalance > 0.01 ? 'text-emerald-600' : 
                            b.netBalance < -0.01 ? 'text-red-600' : 'text-slate-400'
                          }`}>
                            {b.netBalance > 0.01 ? '+' : ''}{formatCurrency(b.netBalance)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {b.netBalance > 0.01 ? 'Gets back' : b.netBalance < -0.01 ? 'Owes' : 'Settled'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/expenses" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors text-slate-700 hover:text-primary-700 font-medium border border-slate-100 hover:border-primary-100 text-center">
                  <TrendingDown className="w-6 h-6 mb-2" />
                  <span className="text-sm">Add Expense</span>
                </Link>
                <Link href="/advances" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors text-slate-700 hover:text-primary-700 font-medium border border-slate-100 hover:border-primary-100 text-center">
                  <PiggyBank className="w-6 h-6 mb-2" />
                  <span className="text-sm">Add Advance</span>
                </Link>
                <Link href="/members" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors text-slate-700 hover:text-primary-700 font-medium border border-slate-100 hover:border-primary-100 text-center">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Add Member</span>
                </Link>
                <Link href="/settlement" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors text-slate-700 hover:text-primary-700 font-medium border border-slate-100 hover:border-primary-100 text-center">
                  <Wallet className="w-6 h-6 mb-2" />
                  <span className="text-sm">Settlement</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <HandCoins className="w-5 h-5 text-slate-400" />
                 Who Owes Whom
               </h2>
               <Link href="/settlement" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Detailed View</Link>
             </div>
             
             {settlements.length === 0 ? (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="font-medium text-emerald-800">Everyone is settled up!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {settlements.map((s, idx) => {
                    const from = tripMembers.find(m => m.id === s.fromMemberId)?.name || 'Unknown';
                    const to = tripMembers.find(m => m.id === s.toMemberId)?.name || 'Unknown';
                    return (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 hover:border-primary-200 transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm font-medium truncate flex-1 text-center">{from}</span>
                          <ArrowRight className="text-slate-400 w-4 h-4 mx-2 flex-shrink-0" />
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-medium truncate flex-1 text-center">{to}</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-1">
                          {formatCurrency(s.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </>
      )}

      {selectedMemberId && (
        <MemberDetailsModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
          members={tripMembers}
          expenses={tripExpenses}
          contributions={tripContributions}
          balances={balances}
        />
      )}
    </div>
  );
}
