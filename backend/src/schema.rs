// @generated automatically by Diesel CLI.

diesel::table! {
    calorie_tracker (id) {
        id -> Int4,
        user_id -> Nullable<Int4>,
        #[max_length = 255]
        food -> Varchar,
        calories -> Int4,
        date -> Timestamp,
    }
}

diesel::table! {
    exercise_progress (id) {
        id -> Int4,
        user_id -> Nullable<Int4>,
        #[max_length = 255]
        exercise -> Varchar,
        repetitions -> Int4,
        sets -> Int4,
        date -> Timestamp,
    }
}

diesel::table! {
    friends (user_id, friend_id) {
        user_id -> Int4,
        friend_id -> Int4,
        #[max_length = 255]
        status -> Nullable<Varchar>,
    }
}

diesel::table! {
    user_privacy_settings (user_id) {
        user_id -> Int4,
        weight_progress_public -> Nullable<Bool>,
        exercise_progress_public -> Nullable<Bool>,
        calorie_tracker_public -> Nullable<Bool>,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        username -> Nullable<Varchar>,
        email -> Varchar,
        password_hash -> Varchar,
        created_at -> Timestamp,
        profile_picture -> Nullable<Varchar>,
        name -> Nullable<Varchar>,
    }
}

diesel::table! {
    weight_progress (id) {
        id -> Int4,
        user_id -> Nullable<Int4>,
        weight -> Numeric,
        date -> Timestamp,
    }
}

diesel::joinable!(calorie_tracker -> users (user_id));
diesel::joinable!(exercise_progress -> users (user_id));
diesel::joinable!(user_privacy_settings -> users (user_id));
diesel::joinable!(weight_progress -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    calorie_tracker,
    exercise_progress,
    friends,
    user_privacy_settings,
    users,
    weight_progress,
);
