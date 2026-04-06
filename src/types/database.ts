export type AccountType = 'cash' | 'debit' | 'credit' | 'savings' | 'ewallet'
export type CategoryType = 'expense' | 'income'
export type TransactionType = 'expense' | 'income' | 'transfer'
export type RecurringRule = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type BudgetPeriod = 'week' | 'biweek' | 'month' | 'quarter'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  currency: string
  initial_balance: number
  icon_name: string
  color_hex: string
  is_included_in_total: boolean
  sort_order: number
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  icon_name: string
  color_hex: string
  type: CategoryType
  sort_order: number
  is_archived: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category_id: string | null
  account_id: string | null
  to_account_id: string | null
  date: string
  note: string | null
  is_recurring: boolean
  recurring_rule: RecurringRule | null
  created_at: string
  category?: Category
  account?: Account
}

export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  period: BudgetPeriod
  start_date: string
  notify_at_80: boolean
  notify_at_100: boolean
  created_at: string
  category?: Category
}

export interface Database {
  public: {
    Tables: {
      accounts: { Row: Account; Insert: Omit<Account, 'id' | 'created_at'>; Update: Partial<Omit<Account, 'id'>> }
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'>; Update: Partial<Omit<Category, 'id'>> }
      transactions: { Row: Transaction; Insert: Omit<Transaction, 'id' | 'created_at'>; Update: Partial<Omit<Transaction, 'id'>> }
      budgets: { Row: Budget; Insert: Omit<Budget, 'id' | 'created_at'>; Update: Partial<Omit<Budget, 'id'>> }
    }
  }
}
