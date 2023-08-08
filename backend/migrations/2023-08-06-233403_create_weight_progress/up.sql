CREATE TABLE weight_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    weight DECIMAL NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
