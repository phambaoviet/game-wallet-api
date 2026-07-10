-- name: CreatePlayer :one
INSERT INTO players (
    username,
    email,
    password_hash
) VALUES (
    $1, $2, $3
)
RETURNING id, username, email, password_hash, created_at, updated_at;

-- name: GetPLayerByID :one
SELECT id, username, email, password_hash, created_at, updated_at
FROM players
WHERE id = $1;

-- name: GetPLayerByEmail :one
SELECT id, username, email, password_hash, created_at, updated_at
FROM players
WHERE email = $1;

