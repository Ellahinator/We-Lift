CREATE TABLE weight_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    weight FLOAT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, date)
);
