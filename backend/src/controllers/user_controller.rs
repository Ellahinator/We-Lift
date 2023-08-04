use anyhow::{Context, Error};
use reqwest::header::{ AUTHORIZATION};
use rocket::http::{Cookie, CookieJar, SameSite};
use rocket::response::{Debug, Redirect};
use rocket::serde::json::Json;
use rocket::{get};
use rocket_oauth2::{OAuth2, TokenResponse};
use serde_json::{self};

use crate::jwt::create_jwt;
use crate::{models::*, LogsDbConn};


#[post("/register", data = "<new_user>")]
pub async fn register(
    conn: LogsDbConn,
    new_user: Json<NewUser>,
    cookies: &CookieJar<'_>
) -> Result<Redirect, NetworkResponse> {
    let result = User::create(new_user.into_inner(), conn).await;

    match result {
        Ok(user) => {
            match create_jwt(user.id) {
                Ok(token) => {
                    cookies.add_private(
                        Cookie::build("jwt", token)
                            .http_only(true)
                            .same_site(SameSite::Strict)
                            .finish(),
                    );
                Ok(Redirect::to("/"))
                },
                Err(err) => {
                    eprintln!("JWT token generation error: {:?}", err);
                    Err(NetworkResponse::InternalServerError(
                        "Failed to generate JWT token".to_string(),
                    ))
                }
            }
        },
        Err(_) => {
            Err(NetworkResponse::BadRequest(
                "Failed to register user".to_string(),
            ))
        }
    }
}

#[post("/login", data = "<login_user>")]
pub async fn login(
    conn: LogsDbConn,
    login_user: Json<LoginUser>,
    cookies: &CookieJar<'_>,
) -> Result<Redirect, NetworkResponse> {
    let result = User::find_by_login(login_user.login.clone(), login_user.password.clone(), conn).await;

    match result {
        Ok(user) => {
            match create_jwt(user.id) {
                Ok(token) => {
                    cookies.add_private(
                        Cookie::build("jwt", token)
                            .http_only(true)
                            .same_site(SameSite::Strict)
                            .finish(),
                    );
                    Ok(Redirect::to("/"))
                },
                Err(err) => {
                    eprintln!("JWT token generation error: {:?}", err);
                    Err(NetworkResponse::InternalServerError(
                        "Failed to generate JWT token".to_string(),
                    ))
                }
            }
        },
        Err(_) => {
            Err(NetworkResponse::Unauthorized(
                "Failed to authorize access".to_string(),
            ))
        }
    }
}

#[get("/login/google")]
pub fn google_login(oauth2: OAuth2<GoogleUserInfo>, cookies: &CookieJar<'_>) -> Redirect {
    oauth2.get_redirect(cookies, &["profile"]).unwrap()
}

#[get("/auth/google")]
pub async fn google_callback(
    token: TokenResponse<GoogleUserInfo>,
    cookies: &CookieJar<'_>,
    conn: LogsDbConn,
) -> Result<Redirect, NetworkResponse> {
    // Build the request client.
    let client = reqwest::Client::builder().build();
    if client.is_err() {
        return Err(NetworkResponse::InternalServerError("Failed to build request client".to_string()));
    }

    // Send the request.
    let response = client.unwrap().get("https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses")
        .header(AUTHORIZATION, format!("Bearer {}", token.access_token()))
        .send().await;
    if response.is_err() {
        return Err(NetworkResponse::InternalServerError("Failed to complete request".to_string()));
    }

    // Parse the response.
    let user_info = response.unwrap().json::<GoogleUserInfo>().await;
    if user_info.is_err() {
        return Err(NetworkResponse::InternalServerError("Failed to deserialize response".to_string()));
    }

    let user_info = user_info.unwrap();
    let email = user_info
        .email_addresses
        .first()
        .and_then(|e| e.get("value"))
        .and_then(|s| s.as_str())
        .unwrap_or("");

    // Set a private cookie with the user's email.
    cookies.add_private(
        Cookie::build("email", email.to_string())
            .same_site(SameSite::Lax)
            .finish(),
    );

    // Find the user by email in the database.
    let result = User::find_by_email(email.to_string(), conn).await;
    match result {
        Ok(user) => {
            match create_jwt(user.id) {
                Ok(token) => {
                    cookies.add_private(
                        Cookie::build("jwt", token)
                            .http_only(true)
                            .same_site(SameSite::Strict)
                            .finish(),
                    );
                    Ok(Redirect::to("/"))
                },
                Err(err) => {
                    eprintln!("JWT token generation error: {:?}", err);
                    Err(NetworkResponse::InternalServerError("Failed to generate JWT token".to_string()))
                }
            }
        },
        Err(_) => {
            Err(NetworkResponse::Unauthorized("Failed to authorize access".to_string()))
        }
    }
}
