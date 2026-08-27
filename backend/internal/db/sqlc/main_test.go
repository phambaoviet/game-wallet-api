package db

import (
	"context"
	"game-wallet-api/util"
	"log"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

var testQueries *Queries
var testStore *Store

func TestMain(m *testing.M) {
	cfg, err := util.LoadConfig("../../..")
	if err != nil {
		log.Fatal("cannot load config file", err)
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DBSource)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}

	testQueries = New(pool)
	testStore = NewStore(pool)

	code := m.Run()
	pool.Close()
	os.Exit(code)
}
