import { useMemo } from 'react';
import { formatCurrency } from '../utils/calculations';
import { X } from 'lucide-react';
import type { Member, Expense, Contribution } from '../types';
import type { MemberBalance } from '../utils/calculations';

interface MemberDetailsModalProps {
  memberId: string;
  onClose: () => void;
  members: Member[];
  expenses: Expense[];
  contributions: Contribution[];
  balances: MemberBalance[];
}

export function MemberDetailsModal({
  memberId,
  onClose,
  members,
  expenses,
  contributions,
  balances
}: MemberDetailsModalProps) {
  const selectedMember = useMemo(() => {
    return members.find(m => m.id === memberId);
  }, [memberId, members]);

  const selectedMemberBalance = useMemo(() => {
    return balances.find(b => b.memberId === memberId);
  }, [memberId, balances]);

  const memberDetails = useMemo(() => {
    if (!memberId) return null;

    const memberAdvances = contributions.filter(c => c.memberId === memberId);
    const memberPaidExpenses = expenses.filter(e => e.paidBy === memberId);
    
    // Expenses where member is a participant
    const memberShareExpenses = expenses.map(e => {
      const participant = e.participants.find(p => p.memberId === memberId);
      if (participant) {
        return {
          title: e.title,
          date: e.date,
          amount: participant.amount
        };
      }
      return null;
    }).filter(Boolean) as {title: string, date: string, amount: number}[];

    return {
      advances: memberAdvances,
      paidExpenses: memberPaidExpenses,
      shareExpenses: memberShareExpenses
    };
  }, [memberId, contributions, expenses]);

  if (!selectedMember || !selectedMemberBalance || !memberDetails) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedMember.name}'s Details
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Advances */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Advances Paid
              <span className="float-right text-primary-600">{formatCurrency(selectedMemberBalance.totalContributed)}</span>
            </h3>
            {memberDetails.advances.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No advances paid.</p>
            ) : (
              <ul className="space-y-2">
                {memberDetails.advances.map(a => (
                  <li key={a.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{new Date(a.date).toLocaleDateString()} - {a.paymentMethod} {a.notes ? `(${a.notes})` : ''}</span>
                    <span className="font-medium">{formatCurrency(a.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Paid Expenses */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Trip Expenses Paid
              <span className="float-right text-primary-600">{formatCurrency(selectedMemberBalance.totalPaid)}</span>
            </h3>
            {memberDetails.paidExpenses.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Did not pay for any trip expenses.</p>
            ) : (
              <ul className="space-y-2">
                {memberDetails.paidExpenses.map(e => (
                  <li key={e.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{e.title}</span>
                    <span className="font-medium">{formatCurrency(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Shared Expenses */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Share of Expenses (Owes)
              <span className="float-right text-red-500">{formatCurrency(selectedMemberBalance.totalShare)}</span>
            </h3>
            {memberDetails.shareExpenses.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Not part of any expenses.</p>
            ) : (
              <ul className="space-y-2">
                {memberDetails.shareExpenses.map((e, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600">{e.title}</span>
                    <span className="font-medium text-slate-700">{formatCurrency(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between text-sm mb-1 text-slate-600">
              <span>Total Contributed (Advances + Paid)</span>
              <span>{formatCurrency(selectedMemberBalance.totalContributed + selectedMemberBalance.totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3 text-slate-600">
              <span>Minus Total Share</span>
              <span>- {formatCurrency(selectedMemberBalance.totalShare)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-200">
              <span>Final Balance</span>
              <span className={
                selectedMemberBalance.netBalance > 0.01 ? 'text-emerald-600' : 
                selectedMemberBalance.netBalance < -0.01 ? 'text-red-600' : 'text-slate-900'
              }>
                {selectedMemberBalance.netBalance > 0.01 ? '+' : ''}{formatCurrency(selectedMemberBalance.netBalance)}
              </span>
            </div>
            <div className="text-right text-xs text-slate-500 mt-1">
              {selectedMemberBalance.netBalance > 0.01 
                ? '(Amount they will receive)' 
                : selectedMemberBalance.netBalance < -0.01 
                  ? '(Amount they need to pay)' 
                  : '(Settled)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
