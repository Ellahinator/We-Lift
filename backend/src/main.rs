#[macro_use]
extern crate rocket;

use dotenvy::dotenv;
use rocket::http::Method;
use rocket::{Build, Rocket};
use rocket_cors::{AllowedHeaders, AllowedOrigins, CorsOptions};
use rocket_sync_db_pools::{database, diesel};
use std::env;

mod jwt;
mod models;
mod schema;

mod controllers;
use controllers::{user_controller, weight_controller};

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[database("postgres_logs")]
pub struct LogsDbConn(diesel::PgConnection);

#[launch]
async fn rocket() -> Rocket<Build> {
    dotenv().ok();
    let frontend_url = env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");

    let allowed_origins = AllowedOrigins::some_exact(&[
        frontend_url,
        String::from("http://localhost:3000"),
        String::from("http://127.0.0.1:3000"),
        String::from("http://0.0.0.0:3000"),
    ]);

    let cors = CorsOptions {
        allowed_origins,
        allowed_methods: vec![
            Method::Get,
            Method::Post,
            Method::Put,
            Method::Delete,
            Method::Options,
        ]
        .into_iter()
        .map(From::from)
        .collect(),
        allowed_headers: AllowedHeaders::all(),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("CORS failed.");

    rocket::build()
        .attach(LogsDbConn::fairing())
        .mount(
            "/",
            routes![
                index,
                user_controller::get_profile,
                user_controller::login,
                user_controller::register,
                user_controller::google_callback,
                user_controller::update_profile,
                user_controller::update_password,
                weight_controller::create_weight_data,
                weight_controller::get_weight_data,
            ],
        )
        .attach(cors)
}
