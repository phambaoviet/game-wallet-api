package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestListWalletTransactionsAPI(t *testing.T) {
	server := newTestServer(t, testStore)

	player := createRandomPlayer(t, server)
	token := loginPlayer(
		t,
		server,
		player.Email,
		player.Password,
	)
	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodGet,
		"/wallets/me/transactions?page=1&limit=10",
		nil,
	)

	require.NoError(t, err)
	request.Header.Set(
		authorizationHeaderKey,
		authorizationTypeBearer+" "+token,
	)
	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
}
func TestListWalletTransactionsUnauthorized(t *testing.T) {
	server := newTestServer(t, testStore)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodGet,
		"/wallets/me/transactions?page=1&limit=10",
		nil,
	)
	require.NoError(t, err)

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusUnauthorized, recorder.Code)
}
func TestListWalletTransactionsInvalidToken(t *testing.T) {
	server := newTestServer(t, testStore)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodGet,
		"/wallets/me/transactions?page=1&limit=10",
		nil,
	)
	require.NoError(t, err)

	request.Header.Set(
		authorizationHeaderKey,
		authorizationTypeBearer+" "+"invalid_token",
	)

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusUnauthorized, recorder.Code)
}
func TestClaimDemoFaucet(t *testing.T) {
	server := newTestServer(t, testStore)
	player := createRandomPlayer(t, server)

	token := loginPlayer(
		t,
		server,
		player.Email,
		player.Password,
	)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodPost,
		"/wallets/claim",
		nil,
	)
	require.NoError(t, err)

	request.Header.Set("Authorization", "Bearer "+token)

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
	wallet, err := testStore.GetWalletByPlayerID(context.Background(), player.ID)
	require.NoError(t, err)
	require.Equal(t, int64(10000), wallet.Balance)

}
func TestClaimDemoFaucetTwice(t *testing.T) {
	server := newTestServer(t, testStore)
	player := createRandomPlayer(t, server)

	token := loginPlayer(
		t,
		server,
		player.Email,
		player.Password,
	)

	// Claim first
	recorder := httptest.NewRecorder()
	request, err := http.NewRequest(
		http.MethodPost,
		"/wallets/claim",
		nil,
	)
	require.NoError(t, err)

	request.Header.Set("Authorization", "Bearer "+token)

	server.router.ServeHTTP(recorder, request)
	require.Equal(t, http.StatusOK, recorder.Code)

	// Claim second
	recorder = httptest.NewRecorder()
	request, err = http.NewRequest(
		http.MethodPost,
		"/wallets/claim",
		nil,
	)
	require.NoError(t, err)

	request.Header.Set("Authorization", "Bearer "+token)

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusBadRequest, recorder.Code)

	// Check balance
	wallet, err := testStore.GetWalletByPlayerID(
		context.Background(),
		player.ID,
	)
	require.NoError(t, err)

	require.Equal(t, int64(10000), wallet.Balance)
}
func TestClaimDemoFaucetNoToken(t *testing.T) {
	server := newTestServer(t, testStore)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodPost,
		"/wallets/claim",
		nil,
	)
	require.NoError(t, err)

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusUnauthorized, recorder.Code)
}
