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
) -> Result<Json<ResponseBody>, NetworkResponse> {
    let result = User::create(new_user.into_inner(), conn).await;

    match result {
        Ok(user) => {
            match create_jwt(user.id) {
                Ok(token) => {
                    println!("Generated token: {}", token);
                    Ok(Json(ResponseBody::AuthToken(token)))
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
) -> Result<Json<ResponseBody>, NetworkResponse> {
    let result = User::find_by_login(login_user.login.clone(), login_user.password.clone(), conn).await;

    match result {
        Ok(user) => {
            match create_jwt(user.id) {
                Ok(token) => {
                    println!("Generated token: {}", token);
                    Ok(Json(ResponseBody::AuthToken(token)))
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
) -> Result<Redirect, Debug<Error>> {
    // Use the token to retrieve the user's Google account information.
    let user_info: GoogleUserInfo = reqwest::Client::builder()
        .build()
        .context("failed to build reqwest client")?
        .get("https://people.googleapis.com/v1/people/me?personFields=names")
        .header(AUTHORIZATION, format!("Bearer {}", token.access_token()))
        .send()
        .await
        .context("failed to complete request")?
        .json()
        .await
        .context("failed to deserialize response")?;

    let real_name = user_info
        .names
        .first()
        .and_then(|n| n.get("displayName"))
        .and_then(|s| s.as_str())
        .unwrap_or("");

    // Set a private cookie with the user's name.
    cookies.add_private(
        Cookie::build("username", real_name.to_string())
            .same_site(SameSite::Lax)
            .finish(),
    );

    Ok(Redirect::to("/"))
}
