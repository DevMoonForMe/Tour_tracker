"use client";

import { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import type { Member } from '@/types';
import { User, Phone, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function MembersPage() {
  const { activeTripId, members, addMember, deleteMember } = useTripStore();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const tripMembers = members.filter(m => m.tripId === activeTripId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !activeTripId) return;

    const newMember: Member = {
      id: crypto.randomUUID(),
      tripId: activeTripId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      createdAt: Date.now()
    };

    addMember(newMember);
    setShowForm(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this member? This might affect existing expenses.')) {
      deleteMember(id);
    }
  };

  if (!activeTripId) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-900">No active trip</h3>
        <p className="text-slate-500 mt-1">Please select or create a trip first.</p>
        <Link href="/trips" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Go to Trips</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Members</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Arun"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. arun@example.com"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      {tripMembers.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No members yet</h3>
          <p className="text-slate-500 mt-1">Add members to start splitting expenses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tripMembers.map(member => (
            <div key={member.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{member.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
