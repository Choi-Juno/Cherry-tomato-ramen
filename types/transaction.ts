export type PaymentMethod = "cash" | "card" | "transfer" | "other";

export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "education"
  | "health"
  | "utilities"
  | "other";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  payment_method: PaymentMethod;
  merchant?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  amount: number;
  description: string;
  category: TransactionCategory;
  payment_method: PaymentMethod;
  merchant?: string;
  date: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

