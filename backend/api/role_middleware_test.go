package api

import (
	"context"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/util"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRequireAdminSuccess(t *testing.T) {
	server := newTestServer(t, testStore)
	player := createRandomPlayer(t, server)

	_, err := testStore.UpdatePlayerRole(
		context.Background(),
		db.UpdatePlayerRoleParams{
			ID:   player.ID,
			Role: util.RoleAdmin,
		},
	)
	require.NoError(t, err)

	token := loginPlayer(t, server, player.Email, player.Password)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(http.MethodGet, "/admin/transactions?page=1&limit=10", nil)
	require.NoError(t, err)

	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	server.router.ServeHTTP(recorder, request)
	require.Equal(t, http.StatusOK, recorder.Code)
}
func TestRequireAdminPlayerForbidden(t *testing.T) {
	server := newTestServer(t, testStore)
	player := createRandomPlayer(t, server)

	token := loginPlayer(t, server, player.Email, player.Password)
	recorder := httptest.NewRecorder()
	request, err := http.NewRequest(http.MethodGet, "/admin/transactions?page=1&limit=10", nil)
	require.NoError(t, err)
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	server.router.ServeHTTP(recorder, request)
	require.Equal(t, http.StatusForbidden, recorder.Code)
}
func TestRequireAdminNoToken(t *testing.T) {
	server := newTestServer(t, testStore)
	
	recorder := httptest.NewRecorder()
	request, err := http.NewRequest(http.MethodGet, "/admin/transactions?page=1&limit=10", nil)
	require.NoError(t, err)

	request.Header.Set("Content-Type", "application/json")
	server.router.ServeHTTP(recorder, request)
	require.Equal(t, http.StatusUnauthorized, recorder.Code)
}
