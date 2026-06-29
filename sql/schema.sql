CREATE TABLE items (
    id          INTEGER PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    examine     TEXT,
    members     BOOLEAN,
    buy_limit   INTEGER,
    lowalch     INTEGER,
    highalch    INTEGER,
    icon        TEXT
);

CREATE TABLE prices (
    id          BIGSERIAL PRIMARY KEY,
    item_id     INTEGER REFERENCES items(id),
    polled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    high        INTEGER,
    high_time   TIMESTAMPTZ,
    low         INTEGER,
    low_time    TIMESTAMPTZ
);

CREATE INDEX idx_prices_item_polled ON prices(item_id, polled_at DESC);
CREATE INDEX idx_prices_polled_at ON prices(polled_at DESC);