import type { Expense, Member, Contribution, Settlement } from '../types';

export interface MemberBalance {
  memberId: string;
  totalPaid: number; // Amount they physically paid for expenses
  totalShare: number; // Amount they are responsible for
  totalContributed: number; // Initial contributions or added later
  netBalance: number; // (TotalPaid) - TotalShare. If > 0, they should receive money. If < 0, they owe money.
}

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  contributions: Contribution[]
): MemberBalance[] {
  const balances: Record<string, MemberBalance> = {};

  // Initialize balances
  members.forEach(member => {
    balances[member.id] = {
      memberId: member.id,
      totalPaid: 0,
      totalShare: 0,
      totalContributed: 0,
      netBalance: 0
    };
  });

  // Calculate Contributions
  contributions.forEach(contribution => {
    if (balances[contribution.memberId]) {
      balances[contribution.memberId].totalContributed += contribution.amount;
    }
  });

  // Calculate Expenses
  expenses.forEach(expense => {
    // Add to totalPaid for the person who paid
    if (balances[expense.paidBy]) {
      balances[expense.paidBy].totalPaid += expense.amount;
    }

    // Add to totalShare for each participant
    expense.participants.forEach(p => {
      if (balances[p.memberId]) {
        balances[p.memberId].totalShare += p.amount;
      }
    });
  });

  // Calculate Net Balance
  // We only care about Paid vs Share for settlement among members.
  // Net Balance = (TotalPaid + TotalContributed) - TotalShare
  Object.values(balances).forEach(b => {
    b.netBalance = (b.totalPaid + b.totalContributed) - b.totalShare;
  });

  return Object.values(balances);
}

export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate debtors (owe money) and creditors (should receive money)
  // Round to 2 decimal places to avoid floating point issues
  const debtors = balances
    .filter(b => b.netBalance < -0.01)
    .map(b => ({ memberId: b.memberId, amount: Math.abs(b.netBalance) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter(b => b.netBalance > 0.01)
    .map(b => ({ memberId: b.memberId, amount: b.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: Number(amount.toFixed(2))
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}
