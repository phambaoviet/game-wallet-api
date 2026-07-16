package main

import (
	"context"
	"game-wallet-api/api"
	"game-wallet-api/config"
	db "game-wallet-api/internal/db/sqlc"
	"log"

	"github.com/joho/godotenv"
)

const serverAddress = "0.0.0.0:8080"

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file")
	}
	ctx := context.Background()
	pool, err := config.ConnectDB(ctx)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()
	store := db.NewStore(pool)
	server := api.NewServer(store)

	err = server.Start(serverAddress)
	if err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
	
}
