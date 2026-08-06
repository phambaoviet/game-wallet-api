-- name: CreatePlayer :one
INSERT INTO players (
    username,
    email,
    password_hash,
    role
) VALUES (
    $1, $2, $3, $4
)
RETURNING id, username, email, password_hash, created_at, updated_at, role;

-- name: GetPlayerByID :one
SELECT id, username, email, password_hash, created_at, updated_at, role
FROM players
WHERE id = $1;

-- name: GetPlayerByEmail :one
SELECT id, username, email, password_hash, created_at, updated_at, role
FROM players
WHERE email = $1;

-- name: ListPlayers :many
SELECT id, username, email, password_hash, created_at, updated_at, role
FROM players
ORDER BY id
LIMIT $1
OFFSET $2;

