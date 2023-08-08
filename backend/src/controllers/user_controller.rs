use crate::jwt::create_jwt;
use crate::schema::users;
use crate::{models::*, LogsDbConn};
use diesel::prelude::*;

use reqwest::header::AUTHORIZATION;
use rocket::serde::json::Json;
use validator::Validate;

#[post("/register", data = "<new_user>")]
pub async fn register(
    conn: LogsDbConn,
    new_user: Json<NewUser>,
) -> Result<Json<ResponseBody>, NetworkResponse> {
    new_user.validate().map_err(|err| {
        let validation_errors = err.field_errors();

        NetworkResponse::BadRequest(format!("Validation error: {:?}", validation_errors))
    })?;
    let result = User::create(new_user.into_inner(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => {
                let auth_response = AuthResponse {
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    profile_picture: user.profile_picture,
                    jwt: token,
                };
                Ok(Json(ResponseBody::Auth(auth_response)))
            }
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
    login_user.validate().map_err(|err| {
        let validation_errors = err.field_errors();

        NetworkResponse::BadRequest(format!("Validation error: {:?}", validation_errors))
    })?;
    let result = User::login(login_user.user.clone(), login_user.password.clone(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => {
                let auth_response = AuthResponse {
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    profile_picture: user.profile_picture,
                    jwt: token,
                };
                Ok(Json(ResponseBody::Auth(auth_response)))
            }
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

                let google_email = google_user.email.clone();

                // The user's email is used as the unique identifier for the user.
                // Check if the user already exists in the database.
                let mut user = User::find_by_email(google_email, &conn).await.unwrap();

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

#[put("/profile/update", data = "<update_user_dto>")]
pub async fn update_profile(
    conn: LogsDbConn,
    key: Result<Jwt, NetworkResponse>,
    update_user_dto: Json<UserDTO>,
) -> Result<Json<ResponseBody>, NetworkResponse> {
    let user_id = key?.claims.subject_id;

    // Validate the update_user_dto
    update_user_dto.validate().map_err(|err| {
        let validation_errors = err.field_errors();

        NetworkResponse::BadRequest(format!("Validation error: {:?}", validation_errors))
    })?;

    let mut changes = UserChanges {
        username: update_user_dto.username.clone(),
        email: update_user_dto.email.clone(),
        name: update_user_dto.name.clone(),
        password_hash: None,
        profile_picture: update_user_dto.profile_picture.clone(),
    };

    if let Some(password_hash) = &update_user_dto.password_hash {
        match User::hash_password(password_hash) {
            Ok(hashed) => changes.password_hash = Some(hashed),
            Err(err) => return Err(NetworkResponse::InternalServerError(err.to_string())),
        };
    }

    match conn
        .run(move |c| {
            diesel::update(users::table.find(user_id))
                .set(&changes)
                .execute(c)
        })
        .await
    {
        Ok(_) => {
            // Fetch the updated user by ID
            let updated_user_result = conn
                .run(move |c| users::table.filter(users::id.eq(&user_id)).first::<User>(c))
                .await;

            match updated_user_result {
                Ok(updated_user) => {
                    let user_details = UserDetails {
                        username: updated_user.username,
                        email: Some(updated_user.email),
                        name: updated_user.name,
                        profile_picture: updated_user.profile_picture,
                    };
                    Ok(Json(ResponseBody::User(user_details)))
                }
                Err(err) => Err(NetworkResponse::InternalServerError(format!(
                    "Failed to find updated user: {}",
                    err
                ))),
            }
        }
        Err(err) => Err(NetworkResponse::InternalServerError(format!(
            "Failed to update user: {}",
            err
        ))),
    }
}
