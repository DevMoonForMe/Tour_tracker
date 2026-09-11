"use client";

import { useState, useMemo } from 'react';
import { useTripStore } from '@/store/useTripStore';
import type { Expense, ExpenseCategory, SplitType, ExpenseParticipant, Member } from '@/types';
import { ReceiptText, AlertCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import Link from 'next/link';

const CATEGORIES: ExpenseCategory[] = ['Travel', 'Hotel', 'Food', 'Petrol', 'Shopping', 'Tickets', 'Activities', 'Parking', 'Other'];
const SPLIT_TYPES: SplitType[] = ['Equal', 'Custom', 'Percentage', 'Individual'];

export default function ExpensesPage() {
  const { activeTripId, expenses, members, addExpense, deleteExpense } = useTripStore();
  const [showForm, setShowForm] = useState(false);

  const tripMembers = useMemo<Member[]>(() => members.filter((m: Member) => m.tripId === activeTripId), [members, activeTripId]);
  const tripExpenses = useMemo<Expense[]>(() => {
    return [...expenses.filter((e: Expense) => e.tripId === activeTripId)].sort(
      (a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, activeTripId]);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food' as ExpenseCategory,
    paidBy: tripMembers.length > 0 ? tripMembers[0].id : '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'Equal' as SplitType,
    notes: ''
  });

  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>(
    tripMembers.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [individualMemberId, setIndividualMemberId] = useState<string>(tripMembers.length > 0 ? tripMembers[0].id : '');

  const [error, setError] = useState('');

  const handleMemberSelect = (id: string) => {
    setSelectedMembers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateParticipants = (): ExpenseParticipant[] | null => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return null;
    }

    const activeMemberIds = Object.keys(selectedMembers).filter(id => selectedMembers[id]);

    if (formData.splitType === 'Equal') {
      if (activeMemberIds.length === 0) {
        setError('Select at least one member for equal split');
        return null;
      }
      const splitAmount = Number((amount / activeMemberIds.length).toFixed(2));

      const participants: ExpenseParticipant[] = activeMemberIds.map(id => ({ memberId: id, amount: splitAmount }));
      const totalAllocated = splitAmount * activeMemberIds.length;
      if (Math.abs(totalAllocated - amount) > 0.001) {
        participants[0].amount += Number((amount - totalAllocated).toFixed(2));
        participants[0].amount = Number(participants[0].amount.toFixed(2));
      }
      return participants;
    }

    if (formData.splitType === 'Custom') {
      let total = 0;
      const participants: ExpenseParticipant[] = [];
      for (const id of activeMemberIds) {
        const val = parseFloat(customAmounts[id] || '0');
        if (isNaN(val) || val < 0) {
          setError(`Invalid custom amount for someone`);
          return null;
        }
        total += val;
        participants.push({ memberId: id, amount: val });
      }
      if (Math.abs(total - amount) > 0.01) {
        setError(`Custom amounts total (${total}) does not match expense amount (${amount})`);
        return null;
      }
      return participants;
    }

    if (formData.splitType === 'Percentage') {
      let totalPct = 0;
      const participants: ExpenseParticipant[] = [];
      for (const id of activeMemberIds) {
        const pct = parseFloat(percentages[id] || '0');
        if (isNaN(pct) || pct < 0) {
          setError(`Invalid percentage for someone`);
          return null;
        }
        totalPct += pct;
        const calcAmount = Number(((amount * pct) / 100).toFixed(2));
        participants.push({ memberId: id, amount: calcAmount, percentage: pct });
      }
      if (Math.abs(totalPct - 100) > 0.01) {
        setError(`Percentages must total 100% (currently ${totalPct}%)`);
        return null;
      }

      const totalAllocated = participants.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalAllocated - amount) > 0.001 && participants.length > 0) {
        participants[0].amount += Number((amount - totalAllocated).toFixed(2));
        participants[0].amount = Number(participants[0].amount.toFixed(2));
      }
      return participants;
    }

    if (formData.splitType === 'Individual') {
      if (!individualMemberId) {
        setError('Select the individual who is responsible');
        return null;
      }
      return [{ memberId: individualMemberId, amount }];
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.amount || !formData.paidBy || !activeTripId) return;

    const participants = calculateParticipants();
    if (!participants) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      tripId: activeTripId,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      paidBy: formData.paidBy,
      date: formData.date,
      splitType: formData.splitType,
      participants,
      notes: formData.notes
    };

    addExpense(newExpense);
    setShowForm(false);

    setFormData(prev => ({
      ...prev,
      title: '',
      amount: '',
      notes: ''
    }));
  };

  if (!activeTripId) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900">No active trip</h3>
        <p className="text-slate-500 mt-1">Please select or create a trip first.</p>
        <Link href="/trips" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Go to Trips</Link>
      </div>
    );
  }

  if (tripMembers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900">Add members first</h3>
        <p className="text-slate-500 mt-1">You need members to split expenses.</p>
        <Link href="/members" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Go to Members</Link>
      </div>
    );
  }

  const activeMemberCount = Object.values(selectedMembers).filter(Boolean).length;
  const parsedAmount = parseFloat(formData.amount) || 0;
  const equalSplitAmount = activeMemberCount > 0 ? parsedAmount / activeMemberCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Expense</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Dinner at Beach Shack"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Amount *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-xl font-bold text-slate-900"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Paid By *</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white font-medium text-primary-700"
                >
                  {tripMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Split Type *</label>
                <select
                  value={formData.splitType}
                  onChange={(e) => setFormData({ ...formData, splitType: e.target.value as SplitType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  {SPLIT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Split Details</h3>

              {(formData.splitType === 'Equal' || formData.splitType === 'Custom' || formData.splitType === 'Percentage') && (
                <div className="space-y-3">
                  {tripMembers.map(m => (
                    <div key={m.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                      <input
                        type="checkbox"
                        id={`member-${m.id}`}
                        checked={selectedMembers[m.id] || false}
                        onChange={() => handleMemberSelect(m.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`member-${m.id}`} className="flex-1 font-medium text-slate-700">{m.name}</label>

                      {formData.splitType === 'Equal' && selectedMembers[m.id] && (
                        <div className="text-sm font-medium text-slate-600">
                          {formatCurrency(equalSplitAmount)}
                        </div>
                      )}

                      {formData.splitType === 'Custom' && selectedMembers[m.id] && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={customAmounts[m.id] || ''}
                            onChange={(e) => setCustomAmounts(prev => ({ ...prev, [m.id]: e.target.value }))}
                            className="w-24 px-2 py-1 border border-slate-300 rounded text-right focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}

                      {formData.splitType === 'Percentage' && selectedMembers[m.id] && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={percentages[m.id] || ''}
                            onChange={(e) => setPercentages(prev => ({ ...prev, [m.id]: e.target.value }))}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-right focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-slate-500">%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.splitType === 'Individual' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Select Individual *</label>
                  <select
                    value={individualMemberId}
                    onChange={(e) => setIndividualMemberId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  >
                    {tripMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                rows={2}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {tripExpenses.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No expenses yet</h3>
          <p className="text-slate-500 mt-1">Add your first expense to track spending.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tripExpenses.map(expense => {
            const payer = tripMembers.find(m => m.id === expense.paidBy)?.name || 'Unknown';
            return (
              <div key={expense.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">
                      {expense.category}
                    </span>
                    <span className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{expense.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Paid by <span className="font-medium text-primary-700">{payer}</span>
                    <span className="mx-2">•</span>
                    Split: <span className="font-medium">{expense.splitType}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                  <div className="text-xl font-bold text-slate-900">
                    {formatCurrency(expense.amount)}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this expense?')) {
                        deleteExpense(expense.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
