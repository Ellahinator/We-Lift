CREATE TABLE exercise_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    exercise VARCHAR(255) NOT NULL,
    repetitions INTEGER NOT NULL,
    sets INTEGER NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
