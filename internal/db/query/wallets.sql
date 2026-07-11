-- name: CreateWallet :one
INSERT INTO wallets (
    player_id,
    balance,
    currency
) VALUES (
    $1, $2, $3
)
RETURNING id, player_id, balance, currency, created_at, updated_at;

-- name: GetWalletByID :one
SELECT id, player_id, balance, currency, created_at, updated_at
FROM wallets
WHERE id = $1;

-- name: GetWalletByPlayerID :one
SELECT id, player_id, balance, currency, created_at, updated_at
FROM wallets
WHERE player_id = $1;

-- name: GetWalletForUpdate :one
SELECT id, player_id, balance, currency, created_at, updated_at
FROM wallets
WHERE id = $1 FOR UPDATE;

-- name: UpdateWalletBalance :one
UPDATE wallets
SET balance = $1
WHERE id = $2
RETURNING id, player_id, balance, currency, created_at, updated_at;

-- name: CreateWalletTransaction :one
INSERT INTO wallet_transactions (
    wallet_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    reference_id,
    description
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, wallet_id, transaction_type, amount, balance_before, balance_after, reference_id, description, created_at;