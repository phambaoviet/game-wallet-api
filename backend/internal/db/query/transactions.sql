-- name: GetAllWalletTransactionsByEmail :many
SELECT wt.*
FROM wallet_transactions wt
         JOIN wallets w
              ON wt.wallet_id = w.id
         JOIN players p
              ON w.player_id = p.id
WHERE p.email = $1
ORDER BY wt.created_at DESC
LIMIT $2
OFFSET $3;

-- name: CountWalletTransactionsByEmail :one
SELECT COUNT(*)
FROM wallet_transactions wt
    JOIN wallets w
        ON wt.wallet_id = w.id
    JOIN players p
        ON w.player_id = p.id
WHERE p.email = $1;

-- name: GetDemoFaucetTransaction :one
SELECT *
FROM wallet_transactions
WHERE wallet_id = $1
  AND transaction_type = 'DEMO_FAUCET'
    LIMIT 1;