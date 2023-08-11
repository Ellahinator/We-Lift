use crate::jwt::create_jwt;
use crate::schema::users;
use crate::{models::*, LogsDbConn};
use diesel::prelude::*;

use rand::{distributions::Alphanumeric, Rng};
use reqwest::header::AUTHORIZATION;
use rocket::serde::json::Json;
use validator::Validate;

#[get("/profile")]
pub async fn get_profile(
    conn: LogsDbConn,
    key: Result<Jwt, NetworkResponse>,
) -> Result<Json<UserDetails>, NetworkResponse> {
    let user_id = key?.claims.subject_id;

    let user_result = conn
        .run(move |c| users::table.find(user_id).first::<User>(c))
        .await;

    match user_result {
        Ok(user) => {
            let profile = UserDetails {
                username: user.username,
                email: Some(user.email),
                profile_picture: user.profile_picture,
                name: user.name,
                created_at: user.created_at,
            };
            Ok(Json(profile))
        }
        Err(err) => Err(NetworkResponse::InternalServerError(format!(
            "Failed to find user: {}",
            err
        ))),
    }
}

#[post("/register", data = "<new_user>")]
pub async fn register(
    conn: LogsDbConn,
    new_user: Json<NewUser>,
) -> Result<Json<AuthResponse>, NetworkResponse> {
    new_user.validate().map_err(|err| {
        let validation_errors = err.field_errors();

        NetworkResponse::BadRequest(format!("Validation error: {:?}", validation_errors))
    })?;
    let result = User::create(new_user.into_inner(), &conn).await;

    match result {
        Ok(user) => match create_jwt(user.id) {
            Ok(token) => {
                let auth_response = AuthResponse {
                    username: None,
                    email: user.email.to_lowercase(),
                    name: user.name,
                    profile_picture: user.profile_picture,
                    jwt: token,
                };
                Ok(Json(auth_response))
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
) -> Result<Json<AuthResponse>, NetworkResponse> {
    login_user.validate().map_err(|err| {
        let validation_errors = err.field_errors();

        NetworkResponse::BadRequest(format!("Validation error: {:?}", validation_errors))
    })?;
    let result = User::login(
        login_user.user.to_lowercase().clone(),
        login_user.password.clone(),
        &conn,
    )
    .await;

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
                Ok(Json(auth_response))
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
) -> Result<Json<AuthResponse>, NetworkResponse> {
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

                let google_email = google_user.email.clone().to_lowercase();

                // The user's email is used as the unique identifier for the user.
                // Check if the user already exists in the database.
                let mut user = User::find_by_email(google_email, &conn).await.unwrap();

                // If the user does not exist, create a new user in the database.
                if user.is_none() {
                    let random_password: String = rand::thread_rng()
                        .sample_iter(&Alphanumeric)
                        .take(16)
                        .map(char::from)
                        .collect();
                    let new_user = NewUser {
                        username: None,
                        email: google_user.email.to_lowercase(),
                        password_hash: random_password,
                    };
                    user = Some(User::create(new_user, &conn).await.unwrap());
                }

                let user = user.unwrap();
                // Generate a JWT
                let jwt_result = create_jwt(user.id);

                // Handle possible JWT creation error
                match jwt_result {
                    Ok(token) => {
                        let auth_response = AuthResponse {
                            username: user.username,
                            email: user.email,
                            name: user.name,
                            profile_picture: user.profile_picture,
                            jwt: token,
                        };
                        Ok(Json(auth_response))
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

#[put("/profile/update", data = "<update_user_dto>")]
pub async fn update_profile(
    conn: LogsDbConn,
    key: Result<Jwt, NetworkResponse>,
    update_user_dto: Json<UserDTO>,
) -> Result<Json<UserDetails>, NetworkResponse> {
    let user_id = key?.claims.subject_id;

    // Validate the update_user_dto
    update_user_dto.validate().map_err(|err| {
        let validation_errors = err.field_errors();

        NetworkResponse::BadRequest(format!("Validation error: {:?}", validation_errors))
    })?;

    let username = update_user_dto
        .username
        .clone()
        .map(|username| username.to_lowercase());

    let email = update_user_dto
        .email
        .clone()
        .map(|email| email.to_lowercase());

    let changes = UserChanges {
        username,
        email,
        name: update_user_dto.name.clone(),
        profile_picture: update_user_dto.profile_picture.clone(),
    };

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
                        created_at: updated_user.created_at,
                    };
                    Ok(Json(user_details))
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

#[put("/profile/update/password", data = "<update_password>")]
pub async fn update_password(
    conn: LogsDbConn,
    key: Result<Jwt, NetworkResponse>,
    update_password: Json<UpdatePassword>,
) -> Result<Json<UserDetails>, NetworkResponse> {
    let user_id = key?.claims.subject_id;

    let current_user = conn
        .run(move |c| users::table.find(user_id).first::<User>(c))
        .await
        .map_err(|err| {
            NetworkResponse::InternalServerError(format!("Failed to find user: {}", err))
        })?;

    // Verify old password
    match current_user.verify_password(&update_password.old_password) {
        Ok(true) => (),
        Ok(false) => {
            return Err(NetworkResponse::Unauthorized(
                "Old password does not match".to_string(),
            ))
        }
        Err(err) => return Err(NetworkResponse::InternalServerError(err.to_string())),
    }
    // Hash new password
    let new_hashed_password = User::hash_password(&update_password.new_password)
        .map_err(|err| NetworkResponse::InternalServerError(err.to_string()))?;

    // Update the user's password in the database
    conn.run(move |c| {
        diesel::update(users::table.find(user_id))
            .set(users::password_hash.eq(new_hashed_password))
            .execute(c)
    })
    .await
    .map_err(|err| {
        NetworkResponse::InternalServerError(format!("Failed to update password: {}", err))
    })?;

    // Fetch the updated user's details
    let updated_user_details = UserDetails {
        username: current_user.username,
        email: Some(current_user.email),
        name: current_user.name,
        profile_picture: current_user.profile_picture,
        created_at: current_user.created_at,
    };

    Ok(Json(updated_user_details))
}
