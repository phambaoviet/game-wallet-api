package api

import (
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
