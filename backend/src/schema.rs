// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Int4,
        username -> Nullable<Varchar>,
        email -> Varchar,
        password_hash -> Varchar,
        created_at -> Timestamp,
    }
}
