import api from './axios';
import {
  Player,
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  TransferPayload,
  Transaction,
  AdminTransaction,
} from '../types/player';

export const playerApi = {
  // POST /players (Register)
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/players', {
      username: payload.username.trim(),
      email: payload.email?.trim() || undefined,
      password: payload.password,
    });
    return response.data;
  },

  // POST /players/login (Login)
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/players/login', {
      email: payload.email.trim(),
      password: payload.password,
    });
    return response.data;
  },

  // GET /players/me (Get authoritative player profile & wallet balance)
  getMe: async (): Promise<Player> => {
    const response = await api.get('/players/me');
    const data = response.data;
    const p = data?.player || data?.data || data;

    return {
      id: Number(p.id),
      username: String(p.username || ''),
      email: String(p.email || ''),
      role: String(p.role || ''),
      balance: Number(p.balance ?? 0),
      currency: String(p.currency || 'COIN'),
      created_at: String(p.created_at || new Date().toISOString()),
      updated_at: p.updated_at ? String(p.updated_at) : undefined,
    };
  },

  // POST /transfers (Transfer funds to another player)
  transfer: async (
    payload: TransferPayload
  ): Promise<{ message?: string; [key: string]: any }> => {
    const response = await api.post('/transfers', {
      receiver_player_id: Number(payload.receiver_player_id),
      amount: Number(payload.amount),
    });
    return response.data;
  },

  // Ping backend to check reachability
  pingBackend: async (): Promise<boolean> => {
    try {
      await api.get('/players/me', { timeout: 3000 });
      return true;
    } catch (err: any) {
      if (err.response) {
        // Backend replied (e.g. 401 Unauthorized), so it is reachable
        return true;
      }
      return false;
    }
  },
};

export const walletApi = {
  // POST /wallets/claim (Claim 10,000 faucet demo coins)
  claim: async (): Promise<{
    message?: string;
    balance?: number;
    [key: string]: any;
  }> => {
    const response = await api.post('/wallets/claim');
    return response.data;
  },
};

export const transactionApi = {
  // GET user transaction history
  listMine: async (
    page = 1,
    limit = 10
  ): Promise<{ data: Transaction[]; total: number }> => {
    try {
      const response = await api.get(
        `/wallets/me/transactions?page=${page}&limit=${limit}`
      );
      const raw = response.data;
      const list = Array.isArray(raw)
        ? raw
        : raw?.data || raw?.transactions || raw?.items || [];
      const total =
        typeof raw?.total === 'number'
          ? raw.total
          : raw?.total_count || list.length;
      return { data: list, total };
    } catch (err: any) {
      // Fallback in case endpoint is under /wallets/transactions
      if (err.response?.status === 404) {
        try {
          const fallback = await api.get(
            `/wallets/transactions?page=${page}&limit=${limit}`
          );
          const raw = fallback.data;
          const list = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.transactions || raw?.items || [];
          return {
            data: list,
            total: typeof raw?.total === 'number' ? raw.total : list.length,
          };
        } catch {
          return { data: [], total: 0 };
        }
      }
      throw err;
    }
  },
};

export const adminApi = {
  // GET /admin/transactions?page=1&limit=20
  listTransactions: async (
    page = 1,
    limit = 20
  ): Promise<{
    data: AdminTransaction[];
    total?: number;
    total_pages?: number;
  }> => {
    const response = await api.get(
      `/admin/transactions?page=${page}&limit=${limit}`
    );
    const raw = response.data;
    const list: AdminTransaction[] = Array.isArray(raw)
      ? raw
      : raw?.data || raw?.transactions || raw?.items || [];

    const total =
      typeof raw?.total === 'number'
        ? raw.total
        : raw?.total_count || list.length;
    const totalPages =
      raw?.total_pages || (total ? Math.ceil(total / limit) : 1);

    return {
      data: list,
      total,
      total_pages: totalPages,
    };
  },
};
