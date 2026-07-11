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
	player, err := queries.CreatePlayer(ctx, db.CreatePlayerParams{
		Username:     "player_two",
		Email:        "player2@example.com",
		PasswordHash: "temporary-hash",
	})
	if err != nil {
		log.Fatal("cannot create player: ", err)
	}

	wallet, err := queries.CreateWallet(ctx, db.CreateWalletParams{
		PlayerID: player.ID,
		Balance:  0,
		Currency: "COIN",
	})
	if err != nil {
		log.Fatal("cannot create wallet: ", err)
	}

	log.Printf("created player: %+v\n", player)
	log.Printf("created wallet: %+v\n", wallet)
	log.Println("Connected to database")
	log.Printf("sqlc queries initialized: %T\n", queries)
}
