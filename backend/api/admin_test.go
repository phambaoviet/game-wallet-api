package api

import (
	"context"
	"encoding/json"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/util"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAdminTransactionsFilterEmail(t *testing.T) {
	server := newTestServer(t, testStore)
	player1 := createRandomPlayer(t, server)
	player2 := createRandomPlayer(t, server)

	wallet1, err := testStore.GetWalletByPlayerID(context.Background(), player1.ID)
	require.NoError(t, err)
	wallet2, err := testStore.GetWalletByPlayerID(context.Background(), player2.ID)
	require.NoError(t, err)

	_, err = testStore.UpdateWalletBalance(
		context.Background(),
		db.UpdateWalletBalanceParams{
			ID:      wallet1.ID,
			Balance: 100000,
		},
	)
	require.NoError(t, err)
	_, err = testStore.CreateWalletTransaction(context.Background(), db.CreateWalletTransactionParams{
		WalletID:        wallet1.ID,
		TransactionType: "TRANSFER_OUT",
		Amount:          50000,
		BalanceBefore:   100000,
		BalanceAfter:    50000,
	})
	require.NoError(t, err)

	_, err = testStore.UpdateWalletBalance(
		context.Background(),
		db.UpdateWalletBalanceParams{
			ID:      wallet2.ID,
			Balance: 100000,
		},
	)
	require.NoError(t, err)
	_, err = testStore.CreateWalletTransaction(context.Background(), db.CreateWalletTransactionParams{
		WalletID:        wallet2.ID,
		TransactionType: "TRANSFER_OUT",
		Amount:          50000,
		BalanceBefore:   100000,
		BalanceAfter:    50000,
	})
	require.NoError(t, err)

	admin := createRandomPlayer(t, server)

	_, err = testStore.UpdatePlayerRole(
		context.Background(),
		db.UpdatePlayerRoleParams{
			ID:   admin.ID,
			Role: util.RoleAdmin,
		},
	)
	require.NoError(t, err)

	token := loginPlayer(
		t,
		server,
		admin.Email,
		admin.Password,
	)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodGet,
		"/admin/transactions?page=1&limit=10&email="+player1.Email,
		nil,
	)
	require.NoError(t, err)

	request.Header.Set(
		authorizationHeaderKey,
		authorizationTypeBearer+" "+token,
	)

	server.router.ServeHTTP(recorder, request)
	require.Equal(t, http.StatusOK, recorder.Code)

	var response db.GetWalletTransactionsResult

	err = json.Unmarshal(recorder.Body.Bytes(), &response)
	require.NoError(t, err)
	require.Equal(t, int64(1), response.Total)
	require.Len(t, response.Transactions, 1)
	tx := response.Transactions[0]

	require.Equal(t, wallet1.ID, tx.WalletID)
	require.NotEqual(t, wallet2.ID, tx.WalletID)
}

func TestAdminTransactionsFilterEmailNotFound(t *testing.T) {
	server := newTestServer(t, testStore)

	admin := createRandomPlayer(t, server)

	_, err := testStore.UpdatePlayerRole(
		context.Background(),
		db.UpdatePlayerRoleParams{
			ID:   admin.ID,
			Role: util.RoleAdmin,
		},
	)
	require.NoError(t, err)

	token := loginPlayer(
		t,
		server,
		admin.Email,
		admin.Password,
	)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodGet,
		"/admin/transactions?page=1&limit=10&email=notfound@example.com",
		nil,
	)
	require.NoError(t, err)

	request.Header.Set(
		authorizationHeaderKey,
		authorizationTypeBearer+" "+token,
	)

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)

	var response db.GetWalletTransactionsResult

	err = json.Unmarshal(recorder.Body.Bytes(), &response)
	require.NoError(t, err)
	require.Equal(t, int64(0), response.Total)
	require.Empty(t, response.Transactions)
}
