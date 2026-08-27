export const formatCurrency = (amount: number, currency: string = 'COIN'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

  return `${formatted} ${currency || 'COIN'}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return dateString;
  }
};

export const truncateId = (id?: string | number): string => {
  if (id === undefined || id === null) return '';
  return String(id);
};

export const formatApiError = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';

  // Network / Connection Error
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || (!err.response && err.request)) {
    return 'Unable to connect to the wallet server. Please check your network and API server.';
  }

  const status = err.response?.status;
  const rawMsg = String(err.response?.data?.message || err.response?.data?.error || err.message || '');
  const lowerMsg = rawMsg.toLowerCase();

  // Known business error checks
  if (status === 401) {
    return 'Your session has expired. Please login again.';
  }
  if (status === 403) {
    return 'You do not have permission to access this page or perform this action.';
  }
  if (status === 404) {
    return 'The requested player or resource was not found.';
  }

  if (lowerMsg.includes('already claimed') || lowerMsg.includes('already_claimed') || lowerMsg.includes('claimed once')) {
    return 'You have already claimed your demo coins.';
  }

  if (lowerMsg.includes('insufficient') || lowerMsg.includes('not enough balance')) {
    return 'Insufficient balance for this transaction.';
  }

  if (lowerMsg.includes('cannot transfer to yourself') || lowerMsg.includes('same player') || lowerMsg.includes('self transfer')) {
    return 'You cannot transfer coins to yourself.';
  }

  if (lowerMsg.includes('receiverplayerid') || lowerMsg.includes('receiver_player_id') || lowerMsg.includes('receiver not found') || lowerMsg.includes('invalid receiver')) {
    return 'Invalid recipient player ID. Please check the recipient ID and try again.';
  }

  if (lowerMsg.includes('amount') && (lowerMsg.includes('gt=0') || lowerMsg.includes('greater than 0') || lowerMsg.includes('positive'))) {
    return 'Transfer amount must be greater than 0.';
  }

  if (rawMsg && !rawMsg.includes('Key:') && !rawMsg.includes('Error:Field validation')) {
    return rawMsg;
  }

  return 'Operation failed. Please verify your inputs and try again.';
};

