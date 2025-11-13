import { TransactionCategory } from "./transaction";

export interface Budget {
  id: string;
  user_id: string;
  category: TransactionCategory;
  amount: number;
  month: string; // Format: YYYY-MM
  created_at: string;
  updated_at: string;
}

export interface BudgetProgress {
  category: TransactionCategory;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface CreateBudgetInput {
  category: TransactionCategory;
  amount: number;
  month: string;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string;
}

