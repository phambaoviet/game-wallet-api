package db

import "context"

type GetWalletTransactionsResult struct {
	Page         int32               `json:"page"`
	Limit        int32               `json:"limit"`
	Total        int64               `json:"total"`
	Transactions []WalletTransaction `json:"transactions"`
}

func (store *Store) GetWalletTransactions(

	ctx context.Context,
	walletID int64,
	page int32,
	limit int32,

) (GetWalletTransactionsResult, error) {

	offset := (page - 1) * limit
	total, err := store.Queries.CountWalletTransactions(ctx, walletID)
	if err != nil {
		return GetWalletTransactionsResult{}, err
	}
	transactions, err := store.Queries.ListWalletTransactions(
		ctx,
		ListWalletTransactionsParams{
			WalletID: walletID,
			Limit:    limit,
			Offset:   offset,
		},
	)
	if err != nil {
		return GetWalletTransactionsResult{}, err
	}
	if transactions == nil {
		transactions = []WalletTransaction{}
	}
	return GetWalletTransactionsResult{
		Page:         page,
		Limit:        limit,
		Total:        total,
		Transactions: transactions,
	}, nil

}
