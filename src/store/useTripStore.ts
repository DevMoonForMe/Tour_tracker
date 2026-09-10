import { create } from 'zustand';
import type { Trip, Member, Contribution, Expense } from '../types';

const API_URL = 'http://localhost:3001';

interface TripState {
  activeTripId: string | null;
  trips: Trip[];
  members: Member[];
  contributions: Contribution[];
  expenses: Expense[];
  
  // Actions
  fetchData: () => Promise<void>;
  setActiveTrip: (tripId: string | null) => void;
  
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
  
  importData: (data: string) => boolean;
  exportData: () => string;
}

export const useTripStore = create<TripState>()((set, get) => ({
  activeTripId: localStorage.getItem('activeTripId') || null,
  trips: [],
  members: [],
  contributions: [],
  expenses: [],
  
  fetchData: async () => {
    try {
      const [tripsRes, membersRes, contributionsRes, expensesRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/members`),
        fetch(`${API_URL}/contributions`),
        fetch(`${API_URL}/expenses`),
        fetch(`${API_URL}/settings`)
      ]);
      const trips = await tripsRes.json();
      const members = await membersRes.json();
      const contributions = await contributionsRes.json();
      const expenses = await expensesRes.json();
      const settings = await settingsRes.json();

      let activeId = localStorage.getItem('activeTripId');
      if (!activeId && settings.activeTripId) {
        activeId = settings.activeTripId;
        localStorage.setItem('activeTripId', activeId);
      }

      set({ trips, members, contributions, expenses, activeTripId: activeId });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },

  setActiveTrip: (tripId) => {
    if (tripId) {
      localStorage.setItem('activeTripId', tripId);
    } else {
      localStorage.removeItem('activeTripId');
    }
    set({ activeTripId: tripId });
  },
  
  addTrip: async (trip) => {
    try {
      await fetch(`${API_URL}/trips`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trip) });
      set((state) => {
        const newState = { trips: [...state.trips, trip], activeTripId: state.activeTripId || trip.id };
        if (!state.activeTripId) {
          localStorage.setItem('activeTripId', trip.id);
        }
        return newState;
      });
    } catch (e) { console.error(e); }
  },
  updateTrip: async (trip) => {
    try {
      await fetch(`${API_URL}/trips/${trip.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trip) });
      set((state) => ({ trips: state.trips.map(t => t.id === trip.id ? trip : t) }));
    } catch (e) { console.error(e); }
  },
  deleteTrip: async (id) => {
    try {
      await fetch(`${API_URL}/trips/${id}`, { method: 'DELETE' });
      set((state) => {
        const newActiveId = state.activeTripId === id ? null : state.activeTripId;
        if (!newActiveId) localStorage.removeItem('activeTripId');
        return { 
          trips: state.trips.filter(t => t.id !== id),
          activeTripId: newActiveId,
        }
      });
    } catch (e) { console.error(e); }
  },
  
  addMember: async (member) => {
    try {
      await fetch(`${API_URL}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(member) });
      set((state) => ({ members: [...state.members, member] }));
    } catch (e) { console.error(e); }
  },
  updateMember: async (member) => {
    try {
      await fetch(`${API_URL}/members/${member.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(member) });
      set((state) => ({ members: state.members.map(m => m.id === member.id ? member : m) }));
    } catch (e) { console.error(e); }
  },
  deleteMember: async (id) => {
    try {
      await fetch(`${API_URL}/members/${id}`, { method: 'DELETE' });
      set((state) => ({ members: state.members.filter(m => m.id !== id) }));
    } catch (e) { console.error(e); }
  },
  
  addContribution: async (contribution) => {
    try {
      await fetch(`${API_URL}/contributions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contribution) });
      set((state) => ({ contributions: [...state.contributions, contribution] }));
    } catch (e) { console.error(e); }
  },
  updateContribution: async (contribution) => {
    try {
      await fetch(`${API_URL}/contributions/${contribution.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contribution) });
      set((state) => ({ contributions: state.contributions.map(c => c.id === contribution.id ? contribution : c) }));
    } catch (e) { console.error(e); }
  },
  deleteContribution: async (id) => {
    try {
      await fetch(`${API_URL}/contributions/${id}`, { method: 'DELETE' });
      set((state) => ({ contributions: state.contributions.filter(c => c.id !== id) }));
    } catch (e) { console.error(e); }
  },
  
  addExpense: async (expense) => {
    try {
      await fetch(`${API_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expense) });
      set((state) => ({ expenses: [...state.expenses, expense] }));
    } catch (e) { console.error(e); }
  },
  updateExpense: async (expense) => {
    try {
      await fetch(`${API_URL}/expenses/${expense.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expense) });
      set((state) => ({ expenses: state.expenses.map(e => e.id === expense.id ? expense : e) }));
    } catch (e) { console.error(e); }
  },
  deleteExpense: async (id) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
      set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }));
    } catch (e) { console.error(e); }
  },
  
  importData: (jsonData: string) => {
    return false;
  },
  exportData: () => {
    return JSON.stringify(get());
  }
}));
