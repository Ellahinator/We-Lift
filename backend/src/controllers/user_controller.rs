use reqwest::header::AUTHORIZATION;
use rocket::serde::json::Json;

use crate::jwt::create_jwt;
use crate::{models::*, LogsDbConn};

#[post("/register", data = "<new_user>")]
pub async fn register(
    conn: LogsDbConn,
    new_user: Json<NewUser>,
) -> Result<Json<ResponseBody>, NetworkResponse> {
    let result = User::create(new_user.into_inner(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => Ok(Json(ResponseBody::AuthToken(token))),
            Err(e) => Err(NetworkResponse::InternalServerError(format!(
                "Failed to create JWT: {}",
                e
            ))),
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
) -> Result<Json<ResponseBody>, NetworkResponse> {
    let result =
        User::find_by_login(login_user.login.clone(), login_user.password.clone(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => Ok(Json(ResponseBody::AuthToken(token))),
            Err(e) => Err(NetworkResponse::InternalServerError(format!(
                "Failed to create JWT: {}",
                e
            ))),
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
                // Check if the user already exists in the database.
                let mut user = User::find_by_email(email, &conn).await.unwrap();

                // If the user does not exist, create a new user in the database.
                if user.is_none() {
                    let new_user = NewUser {
                        username: None,
                        email: google_user.email,
                        password_hash: "NotNeeded".to_string(), // Password isn't needed for OAuth, it gets hashed with salt anyway
                    };
                    user = Some(User::create(new_user, &conn).await.unwrap());
                }

                // Generate a JWT
                let jwt_result = create_jwt(user.unwrap().id);

                // Handle possible JWT creation error
                match jwt_result {
                    Ok(token) => Ok(Json(ResponseBody::AuthToken(token))),
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
