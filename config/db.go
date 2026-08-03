package config

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectDB(ctx context.Context, dbSource string) (*pgxpool.Pool, error) {
	// Parse connection string into config struct
	config, err := pgxpool.ParseConfig(dbSource)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	// Create the connection pool with configuration
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}
	// Ping the database
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	return pool, nil
}
