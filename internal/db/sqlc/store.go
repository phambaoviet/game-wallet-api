package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	_ "github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	*Queries
	pool *pgxpool.Pool
}
type CreatePlayerTxResult struct {
	Player Player
	Wallet Wallet
}
type TransferTxParams struct {
	SenderWalletID   int64  `json:"sender_wallet_id"`
	ReceiverWalletID int64  `json:"receiver_wallet_id"`
	Amount           int64  `json:"amount"`
	Description      string `json:"description"`
}
type TransferResultTx struct {
	SenderWallet        Wallet            `json:"sender_wallet"`
	ReceiverWallet      Wallet            `json:"receiver_wallet"`
	SenderTransaction   WalletTransaction `json:"sender_transaction"`
	ReceiverTransaction WalletTransaction `json:"receiver_transaction"`
}

type DepositTxParams struct {
	ReceiverWalletID int64  `json:"receiver_wallet_id"`
	Amount           int64  `json:"amount"`
	Description      string `json:"description"`
}

type DepositTxResult struct {
	Wallet      Wallet            `json:"wallet"`
	Transaction WalletTransaction `json:"transaction"`
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{
		Queries: New(pool),
		pool:    pool,
	}
}

func (store *Store) execTX(
	ctx context.Context,
	fn func(*Queries) error,
) error {
	// Begin the transaction
	tx, err := store.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()
	// Create new qu
	q := New(tx)
	err = fn(q)
	if err != nil {
		return err
	}
	// Commit the transaction
	if commitErr := tx.Commit(ctx); commitErr != nil {
		return fmt.Errorf("commit: %w", commitErr)
	}
	return nil
}
func (store *Store) TransferTx(ctx context.Context, arg TransferTxParams) (TransferResultTx, error) {
	var result TransferResultTx

	err := store.execTX(ctx, func(q *Queries) error {
		var err error
		senderWallet, err := q.GetWalletForUpdate(ctx, arg.SenderWalletID)
		if err != nil {
			return fmt.Errorf("Failed to get sender : %w", err)
		}
		if senderWallet.Balance < arg.Amount {
			return fmt.Errorf("insufficient balance: %d < %d", senderWallet.Balance, arg.Amount)
		}
		receiverWallet, err := q.GetWalletForUpdate(ctx, arg.ReceiverWalletID)
		if err != nil {
			return fmt.Errorf("Failed to get receiver : %w", err)
		}
		// Deduct money
		result.SenderWallet, err = q.UpdateWalletBalance(ctx, UpdateWalletBalanceParams{
			Balance: -arg.Amount,
			ID:      senderWallet.ID,
		})
		if err != nil {
			return fmt.Errorf("Failed to update sender wallet: %w", err)
		}
		// Add money
		result.ReceiverWallet, err = q.UpdateWalletBalance(ctx, UpdateWalletBalanceParams{
			Balance: arg.Amount,
			ID:      receiverWallet.ID,
		})
		if err != nil {
			return fmt.Errorf("Failed to update receiver wallet: %w", err)
		}
		// Create transaction log for sender
		result.SenderTransaction, err = q.CreateWalletTransaction(ctx, CreateWalletTransactionParams{
			WalletID:        arg.SenderWalletID,
			TransactionType: "TRANSFER_OUT",
			Amount:          arg.Amount,
			BalanceBefore:   senderWallet.Balance,
			BalanceAfter:    result.SenderWallet.Balance,
			Description: pgtype.Text{
				String: arg.Description,
				Valid:  arg.Description != "",
			},
		})
		if err != nil {
			return fmt.Errorf("Failed to create sender transaction: %w", err)
		}
		// Create transaction log for reiceiver
		result.ReceiverTransaction, err = q.CreateWalletTransaction(ctx, CreateWalletTransactionParams{
			WalletID:        arg.ReceiverWalletID,
			TransactionType: "TRANSFER_IN",
			Amount:          arg.Amount,
			BalanceBefore:   receiverWallet.Balance,
			BalanceAfter:    result.ReceiverWallet.Balance,
			Description: pgtype.Text{
				String: arg.Description,
				Valid:  arg.Description != "",
			},
		})
		if err != nil {
			return fmt.Errorf("Failed to create receiver transaction: %w", err)
		}
		return nil
	})

	return result, err
}
func (store *Store) DepositTx(ctx context.Context, arg DepositTxParams) (DepositTxResult, error) {
	var result DepositTxResult
	err := store.execTX(ctx, func(q *Queries) error {
		var err error
		// Create a pre-transaction record
		result.Transaction, err = q.CreateWalletTransaction(ctx, CreateWalletTransactionParams{
			WalletID: arg.ReceiverWalletID,
			Amount:   arg.Amount,
			Description: pgtype.Text{
				String: arg.Description,
				Valid:  arg.Description != "",
			},
		})
		if err != nil {
			return fmt.Errorf("Failed to create receiver transaction: %w", err)
		}
		result.Wallet, err = q.UpdateWalletBalance(ctx, UpdateWalletBalanceParams{
			Balance: arg.Amount,
			ID:      arg.ReceiverWalletID,
		})
		if err != nil {
			return fmt.Errorf("Failed to get receiver wallet: %w", err)
		}
		return nil
	})
	return result, err
}
