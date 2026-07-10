CREATE TABLE players (
    id bigserial PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    email varchar(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallets (
    id bigserial PRIMARY KEY,
    player_id bigint NOT NULL UNIQUE,
    balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency varchar(20) NOT NULL DEFAULT 'coin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE wallet_transactions (
    id bigserial PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    balance_before BIGINT NOT NULL CHECK (balance_before >= 0),
    balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
    reference_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key constraints
ALTER TABLE "wallets" ADD FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
ALTER TABLE "wallet_transactions" ADD FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT;

-- Indexes for faster transaction lookups
CREATE INDEX idx_wallet_transactions_wallet_id
ON wallet_transactions(wallet_id);

CREATE INDEX idx_wallet_transactions_created_at
ON wallet_transactions(created_at);