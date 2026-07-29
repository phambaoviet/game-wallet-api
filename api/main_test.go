package api

import (
	"context"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/util"
	"log"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"
)

var testStore *db.Store

func newTestServer(t *testing.T, store *db.Store) *Server {
	config := util.Config{
		TokenKey:            util.RandomString(32),
		AccessTokenDuration: time.Minute,
	}
	server, err := NewServer(config, store)
	require.NoError(t, err)
	return server
}
func TestMain(m *testing.M) {
	cfg, err := util.LoadConfig("..")
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, cfg.DBSource)
	if err != nil {
		log.Fatal(err)
	}

	testStore = db.NewStore(pool)

	code := m.Run()

	pool.Close()

	os.Exit(code)
}
