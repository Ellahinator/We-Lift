CREATE TABLE calorie_tracker (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    food VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE
);
