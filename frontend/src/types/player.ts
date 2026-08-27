export interface Player {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at?: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
  player?: Player;
  user?: Player;
  data?: {
    token?: string;
    access_token?: string;
    player?: Player;
  };
  message?: string;
}

export interface TransferPayload {
  receiver_player_id: number;
  amount: number;
}

export interface Transaction {
  id: number;
  wallet_id?: number;
  type?: string;
  transaction_type?: string;
  amount: number;
  balance_before?: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export interface AdminTransaction {
  id: number;
  wallet_id: number;
  transaction_type?: string;
  type?: string;
  amount: number;
  balance_before?: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}
