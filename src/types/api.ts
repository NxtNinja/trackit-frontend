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

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: string | number;
  description: string;
  frequency: string;
  start_date: string;
  last_run: string | null;
  created_at: string;
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

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: string | number;
  period: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface BudgetUsageData {
  id: string;
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  period: string;
  startDate: string;
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

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}
