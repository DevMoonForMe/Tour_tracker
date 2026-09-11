import { create } from 'zustand';
import type { Trip, Member, Contribution, Expense } from '../types';

const API_URL = '/api';

interface TripState {
  activeTripId: string | null;
  trips: Trip[];
  members: Member[];
  contributions: Contribution[];
  expenses: Expense[];
  isLoading: boolean;

  // Actions
  fetchData: () => Promise<void>;
  setActiveTrip: (tripId: string | null) => Promise<void>;

  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  addMember: (member: Member) => Promise<void>;
  updateMember: (member: Member) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  addContribution: (contribution: Contribution) => Promise<void>;
  updateContribution: (contribution: Contribution) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;

  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  importData: (data: string) => Promise<boolean>;
  exportData: () => string;
}

export const useTripStore = create<TripState>()((set, get) => ({
  activeTripId: null,
  trips: [],
  members: [],
  contributions: [],
  expenses: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [tripsRes, membersRes, contributionsRes, expensesRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/members`),
        fetch(`${API_URL}/contributions`),
        fetch(`${API_URL}/expenses`),
        fetch(`${API_URL}/settings`),
      ]);

      const trips = tripsRes.ok ? await tripsRes.json() : [];
      const members = membersRes.ok ? await membersRes.json() : [];
      const contributions = contributionsRes.ok ? await contributionsRes.json() : [];
      const expenses = expensesRes.ok ? await expensesRes.json() : [];
      const settings = settingsRes.ok ? await settingsRes.json() : {};

      let activeId = settings?.activeTripId || null;
      if (!activeId || !trips.some((t: Trip) => t.id === activeId)) {
        activeId = trips.length > 0 ? trips[0].id : null;
      }

      set({ trips, members, contributions, expenses, activeTripId: activeId, isLoading: false });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },

  setActiveTrip: async (tripId) => {
    set({ activeTripId: tripId });
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeTripId: tripId }),
      });
    } catch (e) {
      console.error('Failed to sync active trip setting:', e);
    }
  },

  addTrip: async (trip) => {
    try {
      await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });

      const currentActive = get().activeTripId;
      const nextActiveId = currentActive || trip.id;

      if (!currentActive) {
        await get().setActiveTrip(trip.id);
      }

      set((state) => ({
        trips: [...state.trips, trip],
        activeTripId: nextActiveId,
      }));
    } catch (e) {
      console.error('Failed to add trip:', e);
    }
  },

  updateTrip: async (trip) => {
    try {
      await fetch(`${API_URL}/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      set((state) => ({
        trips: state.trips.map((t) => (t.id === trip.id ? trip : t)),
      }));
    } catch (e) {
      console.error('Failed to update trip:', e);
    }
  },

  deleteTrip: async (id) => {
    try {
      await fetch(`${API_URL}/trips/${id}`, { method: 'DELETE' });
      const state = get();
      const remainingTrips = state.trips.filter((t) => t.id !== id);
      const newActiveId = state.activeTripId === id 
        ? (remainingTrips.length > 0 ? remainingTrips[0].id : null) 
        : state.activeTripId;

      if (state.activeTripId === id) {
        await get().setActiveTrip(newActiveId);
      }

      set({
        trips: remainingTrips,
        activeTripId: newActiveId,
      });
    } catch (e) {
      console.error('Failed to delete trip:', e);
    }
  },

  addMember: async (member) => {
    try {
      await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      set((state) => ({ members: [...state.members, member] }));
    } catch (e) {
      console.error('Failed to add member:', e);
    }
  },

  updateMember: async (member) => {
    try {
      await fetch(`${API_URL}/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      set((state) => ({
        members: state.members.map((m) => (m.id === member.id ? member : m)),
      }));
    } catch (e) {
      console.error('Failed to update member:', e);
    }
  },

  deleteMember: async (id) => {
    try {
      await fetch(`${API_URL}/members/${id}`, { method: 'DELETE' });
      set((state) => ({ members: state.members.filter((m) => m.id !== id) }));
    } catch (e) {
      console.error('Failed to delete member:', e);
    }
  },

  addContribution: async (contribution) => {
    try {
      await fetch(`${API_URL}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution),
      });
      set((state) => ({ contributions: [...state.contributions, contribution] }));
    } catch (e) {
      console.error('Failed to add contribution:', e);
    }
  },

  updateContribution: async (contribution) => {
    try {
      await fetch(`${API_URL}/contributions/${contribution.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribution),
      });
      set((state) => ({
        contributions: state.contributions.map((c) => (c.id === contribution.id ? contribution : c)),
      }));
    } catch (e) {
      console.error('Failed to update contribution:', e);
    }
  },

  deleteContribution: async (id) => {
    try {
      await fetch(`${API_URL}/contributions/${id}`, { method: 'DELETE' });
      set((state) => ({
        contributions: state.contributions.filter((c) => c.id !== id),
      }));
    } catch (e) {
      console.error('Failed to delete contribution:', e);
    }
  },

  addExpense: async (expense) => {
    try {
      await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      set((state) => ({ expenses: [...state.expenses, expense] }));
    } catch (e) {
      console.error('Failed to add expense:', e);
    }
  },

  updateExpense: async (expense) => {
    try {
      await fetch(`${API_URL}/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
      }));
    } catch (e) {
      console.error('Failed to update expense:', e);
    }
  },

  deleteExpense: async (id) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (e) {
      console.error('Failed to delete expense:', e);
    }
  },

  importData: async (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      const res = await fetch(`${API_URL}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        await get().fetchData();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  exportData: () => {
    const { trips, members, contributions, expenses, activeTripId } = get();
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: { activeTripId },
        trips,
        members,
        contributions,
        expenses,
      },
      null,
      2
    );
  },
}));
