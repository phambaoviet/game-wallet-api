include .env
export

MIGRATION_DIR=internal/db/migrations
CONN_STRING=postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(DB_SSLMODE)

migrate-create:
	migrate create -ext sql -dir $(MIGRATION_DIR) -seq $(name)
migrate-up:
	migrate -path $(MIGRATION_DIR) -database "$(CONN_STRING)" up
migrate-down:
	migrate -path $(MIGRATION_DIR) -database "$(CONN_STRING)" down 1
sqlc:
	sqlc generate
server:
	go run .
.PHONY: migrate-create migrate-up migrate-down sqlc server