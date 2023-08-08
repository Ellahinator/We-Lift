CREATE TABLE friends (
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    status VARCHAR(255) DEFAULT 'pending',
    PRIMARY KEY (user_id, friend_id)
);
