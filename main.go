package main

import (
	"context"
	"game-wallet-api/config"
	db "game-wallet-api/internal/db/sqlc"
	"log"

	"github.com/joho/godotenv"
)

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

	queries := db.New(pool)
	log.Println("Connected to database")
	log.Printf("sqlc queries initialized: %T\n", queries)
}
