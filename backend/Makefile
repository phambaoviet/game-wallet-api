include .env
export

MIGRATION_DIR=internal/db/migrations
CONN_STRING=$(DB_SOURCE)

migrate-create:
	migrate create -ext sql -dir $(MIGRATION_DIR) -seq $(name)
migrate-up:
	migrate -path $(MIGRATION_DIR) -database "$(CONN_STRING)" up
migrate-down:
	migrate -path $(MIGRATION_DIR) -database "$(CONN_STRING)" down 1
sqlc:
	sqlc generate
server:
	go run ./cmd/server
test:
	go test -v -cover ./...
.PHONY: migrate-create migrate-up migrate-down sqlc server
