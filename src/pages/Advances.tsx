import { useState, useMemo } from 'react';
import { useTripStore } from '../store/useTripStore';
import type { Contribution } from '../types';
import { formatCurrency } from '../utils/calculations';
import { PiggyBank, CreditCard, Banknote, Landmark, Smartphone, Trash2 } from 'lucide-react';

export function Advances() {
  const { activeTripId, members, contributions, addContribution, deleteContribution } = useTripStore();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    paymentMethod: 'UPI' as Contribution['paymentMethod'],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const tripMembers = members.filter(m => m.tripId === activeTripId);
  const tripContributions = contributions.filter(c => c.tripId === activeTripId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalAdvances = tripContributions.reduce((sum, c) => sum + c.amount, 0);

  const advancePerHead = useMemo(() => {
    const sums: Record<string, number> = {};
    tripContributions.forEach(c => {
      sums[c.memberId] = (sums[c.memberId] || 0) + c.amount;
    });
    return Object.entries(sums).map(([memberId, amount]) => {
      const member = tripMembers.find(m => m.id === memberId);
      return { memberId, name: member?.name || 'Unknown', amount };
    }).sort((a, b) => b.amount - a.amount);
  }, [tripContributions, tripMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount || !activeTripId) return;

    const newContribution: Contribution = {
      id: crypto.randomUUID(),
      tripId: activeTripId,
      memberId: formData.memberId,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    };

    addContribution(newContribution);
    setShowForm(false);
    setFormData({
      ...formData,
      amount: '',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this advance payment?')) {
      deleteContribution(id);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <Banknote className="w-5 h-5" />;
      case 'Card': return <CreditCard className="w-5 h-5" />;
      case 'UPI': return <Smartphone className="w-5 h-5" />;
      case 'Bank Transfer': return <Landmark className="w-5 h-5" />;
      default: return <PiggyBank className="w-5 h-5" />;
    }
  };

  if (!activeTripId) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900">No active trip</h3>
        <p className="text-slate-500 mt-1">Please select or create a trip first.</p>
        <a href="/trips" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Go to Trips</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Advances</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Advance'}
        </button>
      </div>

      {!showForm && tripContributions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                 <PiggyBank className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-sm font-medium text-primary-800">Total Advances</p>
                 <p className="text-2xl font-bold text-primary-900">{formatCurrency(totalAdvances)}</p>
               </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-medium text-slate-800 mb-3">Advance by Member</h3>
            <div className="space-y-2">
              {advancePerHead.map(m => (
                <div key={m.memberId} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{m.name}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add Advance Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Member *</label>
                <select 
                  required
                  value={formData.memberId}
                  onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">Select Member</option>
                  {tripMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">₹</span>
                  <input 
                    type="number" 
                    required
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date *</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Payment Method *</label>
                <select 
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as Contribution['paymentMethod']})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Flight ticket advance"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                Save Advance
              </button>
            </div>
          </form>
        </div>
      )}

      {tripContributions.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No advances yet</h3>
          <p className="text-slate-500 mt-1">Record pre-trip payments here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {tripContributions.map(contribution => {
              const member = tripMembers.find(m => m.id === contribution.memberId);
              return (
                <li key={contribution.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start sm:items-center">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                        {getPaymentIcon(contribution.paymentMethod)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {member?.name || 'Unknown Member'}
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{new Date(contribution.date).toLocaleDateString()}</span>
                          <span>&bull;</span>
                          <span>{contribution.paymentMethod}</span>
                        </div>
                        {contribution.notes && (
                          <div className="text-sm text-slate-600 mt-1">
                            "{contribution.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="font-bold text-lg text-slate-900">
                        {formatCurrency(contribution.amount)}
                      </span>
                      <button 
                        onClick={() => handleDelete(contribution.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
