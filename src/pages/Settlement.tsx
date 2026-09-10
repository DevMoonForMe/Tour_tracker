import { useMemo, useState } from 'react';
import { useTripStore } from '../store/useTripStore';
import { calculateBalances, calculateSettlements, formatCurrency } from '../utils/calculations';
import { HandCoins, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { MemberDetailsModal } from '../components/MemberDetailsModal';

export function Settlement() {
  const { activeTripId, members, expenses, contributions } = useTripStore();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const tripMembers = members.filter(m => m.tripId === activeTripId);
  const tripExpenses = expenses.filter(e => e.tripId === activeTripId);
  const tripContributions = contributions.filter(c => c.tripId === activeTripId);

  const balances = useMemo(() => {
    return calculateBalances(tripMembers, tripExpenses, tripContributions);
  }, [tripMembers, tripExpenses, tripContributions]);

  const settlements = useMemo(() => {
    return calculateSettlements(balances);
  }, [balances]);

  if (!activeTripId) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <HandCoins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900">No active trip</h3>
        <p className="text-slate-500 mt-1">Please select or create a trip first.</p>
        <a href="/trips" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Go to Trips</a>
      </div>
    );
  }

  if (tripMembers.length === 0 || tripExpenses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <HandCoins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900">Not enough data</h3>
        <p className="text-slate-500 mt-1">Add members and expenses to see settlements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settlement</h1>
        <p className="text-slate-500">Suggested minimal transactions to settle all debts</p>
      </header>

      {settlements.length === 0 ? (
        <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-emerald-800">Everyone is settled up!</h3>
          <p className="text-emerald-600 mt-1">No one owes anything.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {settlements.map((s, idx) => {
              const from = tripMembers.find(m => m.id === s.fromMemberId)?.name || 'Unknown';
              const to = tripMembers.find(m => m.id === s.toMemberId)?.name || 'Unknown';
              return (
                <li key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-lg font-medium text-slate-700 w-full sm:w-auto justify-center">
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg min-w-[100px] text-center">{from}</span>
                    <ArrowRight className="text-slate-400 w-5 h-5 flex-shrink-0" />
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg min-w-[100px] text-center">{to}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl w-full sm:w-auto text-center border border-slate-100 shadow-sm">
                    {formatCurrency(s.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Detailed Balances</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Member</th>
                  <th className="p-4 font-medium text-right hidden sm:table-cell">Total Paid</th>
                  <th className="p-4 font-medium text-right hidden sm:table-cell">Advances</th>
                  <th className="p-4 font-medium text-right hidden sm:table-cell">Total Share</th>
                  <th className="p-4 font-medium text-right">Balance</th>
                  <th className="p-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balances.map(b => {
                  const member = tripMembers.find(m => m.id === b.memberId);
                  if (!member) return null;
                  
                  return (
                    <tr key={b.memberId} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-900">{member.name}</td>
                      <td className="p-4 text-right text-slate-600 hidden sm:table-cell">{formatCurrency(b.totalPaid)}</td>
                      <td className="p-4 text-right text-slate-600 hidden sm:table-cell">{formatCurrency(b.totalContributed)}</td>
                      <td className="p-4 text-right text-slate-600 hidden sm:table-cell">{formatCurrency(b.totalShare)}</td>
                      <td className={`p-4 text-right font-bold ${
                        b.netBalance > 0.01 ? 'text-emerald-600' : 
                        b.netBalance < -0.01 ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {b.netBalance > 0.01 ? '+' : ''}{formatCurrency(b.netBalance)}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSelectedMemberId(b.memberId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Final Pay</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Final Pay Details Modal */}
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
