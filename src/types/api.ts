export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: string | number;
  description: string;
  date: string;
  created_at: string;
  recurring_id: string | null;
  category_name?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BudgetUsageData {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface CategoryAnalyticsData {
  name: string;
  total: number | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MonthlyTrendData {
  month: string;
  income: number | string;
  expense: number | string;
}
