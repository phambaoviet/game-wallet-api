package api

import (
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/util"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func newTestServer(t *testing.T, store *db.Store) *Server {
	config := util.Config{
		TokenKey:            util.RandomString(32),
		AccessTokenDuration: time.Minute,
	}
	server, err := NewServer(config, store)
	require.NoError(t, err)
	return server
}
