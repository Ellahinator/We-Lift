use anyhow::{Context, Error};
use reqwest::header::AUTHORIZATION;
use rocket::get;
use rocket::http::{Cookie, CookieJar, SameSite};
use rocket::response::{Debug, Redirect};
use rocket::serde::json::Json;
use rocket_oauth2::{OAuth2, TokenResponse};
use serde_json::{self};

use crate::jwt::create_jwt;
use crate::{models::*, LogsDbConn};

#[post("/register", data = "<new_user>")]
pub async fn register(
    conn: LogsDbConn,
    new_user: Json<NewUser>,
    cookies: &CookieJar<'_>,
) -> Result<Redirect, NetworkResponse> {
    let result = User::create(new_user.into_inner(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => {
                cookies.add_private(
                    Cookie::build("jwt", token)
                        .http_only(true)
                        .same_site(SameSite::Strict)
                        .finish(),
                );
                Ok(Redirect::to("/"))
            }
            Err(err) => {
                eprintln!("JWT token generation error: {:?}", err);
                Err(NetworkResponse::InternalServerError(
                    "Failed to generate JWT token".to_string(),
                ))
            }
        },
        Err(_) => Err(NetworkResponse::BadRequest(
            "Failed to register user".to_string(),
        )),
    }
}

#[post("/login", data = "<login_user>")]
pub async fn login(
    conn: LogsDbConn,
    login_user: Json<LoginUser>,
    cookies: &CookieJar<'_>,
) -> Result<Redirect, NetworkResponse> {
    let result =
        User::find_by_login(login_user.login.clone(), login_user.password.clone(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => {
                cookies.add_private(
                    Cookie::build("jwt", token)
                        .http_only(true)
                        .same_site(SameSite::Strict)
                        .finish(),
                );
                Ok(Redirect::to("/"))
            }
            Err(err) => {
                eprintln!("JWT token generation error: {:?}", err);
                Err(NetworkResponse::InternalServerError(
                    "Failed to generate JWT token".to_string(),
                ))
            }
        },
        Err(_) => Err(NetworkResponse::Unauthorized(
            "Failed to authorize access".to_string(),
        )),
    }
}
#[post("/auth/google", data = "<access_token>")]
pub async fn google_callback(
    access_token: Json<AccessToken>,
    conn: LogsDbConn,
    cookies: &CookieJar<'_>,
) -> Result<Json<ResponseBody>, NetworkResponse> {
    // Build the request client.
    let client = reqwest::Client::builder().build().unwrap();

    // Use the access token to retrieve the user's Google account information.
    let response = client
        .get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json")
        .header(AUTHORIZATION, format!("Bearer {}", access_token.token))
        .send()
        .await;

    match response {
        Ok(response) => {
            if response.status().is_success() {
                let google_user: GoogleUserInfo = response.json().await.unwrap();

                let email = google_user.email.clone();

                // The user's email is used as the unique identifier for the user.
                // Use the user's email to check if the user already exists in your database.
                let mut user = User::find_by_email(email, &conn).await.unwrap();

                // If the user does not exist, create a new user in your database.
                if user.is_none() {
                    let new_user = NewUser {
                        username: None,
                        email: google_user.email,
                        password_hash: "NotNeeded".to_string(), // Password isn't needed for OAuth
                    };
                    user = Some(User::create(new_user, &conn).await.unwrap());
                }

                // Generate a JWT for the user using your create_jwt function.
                let jwt_result = create_jwt(user.unwrap().id);

                // Handle possible JWT creation error
                match jwt_result {
                    Ok(token) => {
                        // Set a cookie with the JWT.
                        cookies.add_private(
                            Cookie::build("jwt", token.clone())
                                .http_only(true)
                                .same_site(SameSite::Strict)
                                .finish(),
                        );
                        Ok(Json(ResponseBody::AuthToken(token)))
                    }
                    Err(e) => Err(NetworkResponse::InternalServerError(format!(
                        "Failed to create JWT: {}",
                        e
                    ))),
                }
            } else {
                Err(NetworkResponse::BadRequest(
                    "Invalid access token".to_string(),
                ))
            }
        }
        Err(_) => Err(NetworkResponse::InternalServerError(
            "Failed to verify access token".to_string(),
        )),
    }
}
