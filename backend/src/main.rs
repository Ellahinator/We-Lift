#[macro_use] 
extern crate rocket;

use rocket::http::Method;
use rocket::{Build, Rocket};
use rocket_cors::{AllowedOrigins, CorsOptions, AllowedHeaders};
use dotenvy::dotenv;
use std::env;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

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

    rocket::build().mount("/", routes![index]).attach(cors)
}
