export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  notes?: string;
  createdAt: number;
}

export interface Member {
  id: string;
  tripId: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: number;
}

export interface Contribution {
  id: string;
  tripId: string;
  memberId: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  notes?: string;
}

export interface ExpenseParticipant {
  memberId: string;
  amount: number;
  percentage?: number;
}

export type ExpenseCategory = 'Travel' | 'Hotel' | 'Food' | 'Petrol' | 'Shopping' | 'Tickets' | 'Activities' | 'Parking' | 'Other';
export type SplitType = 'Equal' | 'Custom' | 'Percentage' | 'Individual';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string; // memberId
  date: string;
  splitType: SplitType;
  participants: ExpenseParticipant[];
  notes?: string;
}

export interface Settlement {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}
