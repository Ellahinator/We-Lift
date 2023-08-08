CREATE TABLE user_privacy_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    profile_public BOOLEAN DEFAULT TRUE,
    weight_progress_public BOOLEAN DEFAULT TRUE,
    exercise_progress_public BOOLEAN DEFAULT TRUE,
    calorie_tracker_public BOOLEAN DEFAULT TRUE
);
