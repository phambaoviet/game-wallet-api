package main

import (
	"context"
	"game-wallet-api/api"
	"game-wallet-api/config"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/util"
	"log"
)

func main() {
	cfg, err := util.LoadConfig(".")
	if err != nil {
		log.Fatal("cannot load config", err)
	}
	ctx := context.Background()
	pool, err := config.ConnectDB(ctx, cfg.DBSource)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()
	store := db.NewStore(pool)
	server, err := api.NewServer(cfg, store)
	if err != nil {
		log.Fatalf("failed to start server: %v", err)
	}

	err = server.Start(cfg.ServerAddress)
	if err != nil {
		log.Fatalf("failed to start server: %v", err)
	}

}
