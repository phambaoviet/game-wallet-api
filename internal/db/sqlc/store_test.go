package db

import (
	"context"
	"math/rand"
	"strings"
	"testing"
	"time"
)

const nonExistentWalletID int64 = 9_999_999_999

// init sets up the random seed generator
func init() {
	rand.Seed(time.Now().UnixNano())
}

// randomString generates a random string of length n
func randomString(n int) string {
	const alphabet = "abcdefghijklmnopqrstuvwxyz"
	var sb strings.Builder
	k := len(alphabet)
	for i := 0; i < n; i++ {
		c := alphabet[rand.Intn(k)]
		sb.WriteByte(c)
	}
	return sb.String()
}

// random PlayerName generates a random player username
func randomPlayerName() string {
	return randomString(10)
}

// randomEmail generates a random email address
func randomEmail() string {
	return randomString(6) + "@example.com"
}

func createRandomPlayer(t *testing.T) Player {
	arg := CreatePlayerParams{
		Username:     randomPlayerName(),
		Email:        randomEmail(),
		PasswordHash: "hashed_password_123",
	}
	player, err := testQueries.CreatePlayer(context.Background(), arg)
	if err != nil {
		t.Fatal("failed to create random player:", err)
	}

	return player
}

func createRandomWallet(t *testing.T, balance int64) Wallet {
	player := createRandomPlayer(t)
	arg := CreateWalletParams{
		PlayerID: player.ID,
		Balance:  balance,
		Currency: "COIN",
	}
	wallet, err := testQueries.CreateWallet(context.Background(), arg)
	if err != nil {
		t.Fatal("failed to create random wallet:", err)
	}
	return wallet
}

func TestTransferTx(t *testing.T) {
	wallet1 := createRandomWallet(t, 100)
	wallet2 := createRandomWallet(t, 0)

	amount := int64(20)
	result, err := testStore.TransferTx(context.Background(), TransferTxParams{
		SenderWalletID:   wallet1.ID,
		ReceiverWalletID: wallet2.ID,
		Amount:           amount,
		Description:      "Test transfer 20 coin",
	})

	if err != nil {
		t.Fatal("failed to transfer transaction:", err)
	}
	if result.SenderWallet.Balance != 80 {
		t.Errorf("expected sender balance to be 80, got %d", result.SenderWallet.Balance)
	}
	if result.ReceiverWallet.Balance != 20 {
		t.Errorf("expected receiver balance to be 20, got %d", result.ReceiverWallet.Balance)
	}
}
func TestTransferTxInsufficientFunds(t *testing.T) {
	wallet1 := createRandomWallet(t, 10)
	wallet2 := createRandomWallet(t, 0)
	amount := int64(20)

	_, err := testStore.TransferTx(context.Background(), TransferTxParams{
		SenderWalletID:   wallet1.ID,
		ReceiverWalletID: wallet2.ID,
		Amount:           amount,
		Description:      "Test transfer 20 coin",
	})
	if err == nil {
		t.Error("expected error, got nil")
	}
	// Get data from wallet1 after error
	updatedWallet1, err := testQueries.GetWalletByID(context.Background(), wallet1.ID)
	if err != nil {
		t.Fatal("failed to get wallet by ID:", err)
	}
	if updatedWallet1.Balance != wallet1.Balance {
		t.Error("expected wallet to be updated")
	}
	updatedWallet2, err := testQueries.GetWalletByID(context.Background(), wallet2.ID)
	if err != nil {
		t.Fatal("failed to get wallet by ID:", err)
	}
	if updatedWallet2.Balance != wallet2.Balance {
		t.Error("expected wallet to be updated")
	}
}

func TestTransferTxSenderNotFound(t *testing.T) {
	receiverWallet := createRandomWallet(t, 10)
	amount := int64(20)

	_, err := testStore.TransferTx(context.Background(), TransferTxParams{
		SenderWalletID:   nonExistentWalletID,
		ReceiverWalletID: receiverWallet.ID,
		Amount:           amount,
		Description:      "Test transfer 20 coin",
	})
	if err == nil {
		t.Error("expected error, got nil")
	}

	updatedSender, getErr := testStore.GetWalletByID(context.Background(), receiverWallet.ID)
	if getErr != nil {
		t.Fatal(getErr)
	}
	if updatedSender.Balance != receiverWallet.Balance {
		t.Errorf("receiver balance changed: got %d, expected %d", updatedSender.Balance, receiverWallet.Balance)
	}
}
func TestTransferTxReceiverNotFound(t *testing.T) {
	senderWallet := createRandomWallet(t, 10)
	amount := int64(20)

	_, err := testStore.TransferTx(context.Background(), TransferTxParams{
		SenderWalletID:   senderWallet.ID,
		ReceiverWalletID: nonExistentWalletID,
		Amount:           amount,
		Description:      "Test transfer 20 coin",
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	updatedSender, getErr := testStore.GetWalletByID(context.Background(), senderWallet.ID)
	if getErr != nil {
		t.Fatal(getErr)
	}
	if updatedSender.Balance != senderWallet.Balance {
		t.Errorf("sender balance changed: got %d, expected %d", updatedSender.Balance, senderWallet.Balance)
	}
}
func TestDepositTx(t *testing.T) {
	wallet := createRandomWallet(t, 10)
	amount := int64(20)

	result, err := testStore.DepositTx(context.Background(), DepositTxParams{
		ReceiverWalletID: wallet.ID,
		Amount:           amount,
		Description:      "Test deposit 20 coin",
	})

	if err != nil {
		t.Fatal("failed to deposit transaction:", err)
	}
	updatedWallet, err := testQueries.GetWalletByID(context.Background(), wallet.ID)
	if err != nil {
		t.Fatal("failed to get wallet by ID:", err)
	}
	if updatedWallet.Balance-wallet.Balance != amount {
		t.Errorf("balance mismatch: got difference %d, expected %d", updatedWallet.Balance-wallet.Balance, amount)
	}
	if result.Transaction.Amount != amount {
		t.Errorf("amount mismatch: got %d, expected %d", result.Transaction.Amount, amount)
	}
	if result.Wallet.ID != wallet.ID {
		t.Errorf("wallet mismatch: got %d, expected %d", result.Wallet.ID, wallet.ID)
	}

}
