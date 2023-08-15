use crate::jwt::decode_jwt;
use crate::schema::users;
use crate::LogsDbConn;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use jsonwebtoken::errors::Error;
use lazy_static::lazy_static;
use regex::Regex;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::serde::{Deserialize, Serialize};
use rocket::Responder;
use validator::{Validate, ValidationError};

#[derive(Queryable)]
pub struct User {
    pub id: i32,
    pub username: Option<String>,
    pub email: String,
    pub password_hash: String,
    pub created_at: NaiveDateTime,
    pub profile_picture: Option<String>,
    pub name: Option<String>,
}

#[derive(Insertable, Deserialize, Validate)]
#[diesel(table_name = users)]
pub struct NewUser {
    #[validate(regex(path = "USERNAME_REGEX"))]
    pub username: Option<String>,
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    #[validate(
        length(min = 6, message = "Password must be at least 6 characters"),
        custom(function = "validate_password", message = "Invalid password")
    )]
    pub password_hash: String,
}

#[derive(Deserialize, Validate)]
pub struct LoginUser {
    pub user: String,
    #[validate(
        length(min = 6, message = "Password must be at least 6 characters"),
        custom(function = "validate_password", message = "Invalid password")
    )]
    pub password: String,
}

#[derive(Deserialize, Validate)]
pub struct UserDTO {
    #[validate(regex(path = "USERNAME_REGEX"))]
    pub username: Option<String>,
    #[validate(email(message = "Invalid email address"))]
    pub email: Option<String>,
    pub name: Option<String>,
    #[validate(
        length(min = 6, message = "Password must be at least 6 characters"),
        custom(function = "validate_password", message = "Invalid password")
    )]
    pub password_hash: Option<String>,
    #[validate(url(message = "Invalid URL"))]
    pub profile_picture: Option<String>,
}

#[derive(AsChangeset)]
#[diesel(table_name = users)]
pub struct UserChanges {
    pub username: Option<String>,
    pub email: Option<String>,
    pub name: Option<String>,
    pub profile_picture: Option<String>,
}

#[derive(Serialize)]
pub struct UserDetails {
    pub username: Option<String>,
    pub email: Option<String>,
    pub name: Option<String>,
    pub profile_picture: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Serialize, Deserialize)]
pub struct UpdatePassword {
    pub old_password: String,
    pub new_password: String,
}

impl User {
    pub async fn create(new_user: NewUser, conn: &LogsDbConn) -> Result<User, UserError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let password_hash = match argon2.hash_password(new_user.password_hash.as_bytes(), &salt) {
            Ok(hash) => hash.to_string(),
            Err(e) => return Err(UserError::HashingError(e.to_string())),
        };

        let user = NewUser {
            username: new_user.username,
            email: new_user.email.to_lowercase(),
            password_hash,
        };

        let user_email = user.email.clone();

        conn.run(move |c| diesel::insert_into(users::table).values(&user).execute(c))
            .await?;

        conn.run(move |c| {
            users::table
                .filter(users::email.eq(&user_email))
                .first::<User>(c)
        })
        .await
        .map_err(UserError::DatabaseError)
    }

    pub async fn login(
        username_or_email: String,
        password: String,
        conn: &LogsDbConn,
    ) -> Result<User, UserError> {
        let result = conn
            .run(move |c| {
                users::table
                    .filter(
                        users::email
                            .eq(&username_or_email)
                            .or(users::username.eq(&username_or_email)),
                    )
                    .first::<User>(c)
            })
            .await;

        match result {
            Ok(user) => {
                let parsed_hash = match PasswordHash::new(&user.password_hash) {
                    Ok(parsed_hash) => parsed_hash,
                    Err(e) => return Err(UserError::HashingError(e.to_string())),
                };

                if Argon2::default()
                    .verify_password(password.as_bytes(), &parsed_hash)
                    .is_ok()
                {
                    Ok(user)
                } else {
                    Err(UserError::NotFound)
                }
            }
            Err(e) => Err(UserError::DatabaseError(e)),
        }
    }

    pub async fn find_by_email(
        email: String,
        conn: &LogsDbConn,
    ) -> Result<Option<User>, UserError> {
        let result = conn
            .run(move |c| {
                users::table
                    .filter(users::email.eq(&email))
                    .first::<User>(c)
                    .optional()
            })
            .await;

        match result {
            Ok(user_opt) => Ok(user_opt),
            Err(e) => Err(UserError::from(e)),
        }
    }

    pub fn hash_password(password: &str) -> Result<String, UserError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let password_hash = match argon2.hash_password(password.as_bytes(), &salt) {
            Ok(hash) => hash.to_string(),
            Err(e) => return Err(UserError::HashingError(e.to_string())),
        };
        Ok(password_hash)
    }

    pub fn verify_password(&self, password: &str) -> Result<bool, UserError> {
        let parsed_hash = PasswordHash::new(&self.password_hash)
            .map_err(|e| UserError::HashingError(e.to_string()))?;
        if Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
        {
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

#[derive(Responder, Debug)]
pub enum NetworkResponse {
    #[response(status = 200)]
    Ok(String),
    #[response(status = 201)]
    Created(String),
    #[response(status = 400)]
    BadRequest(String),
    #[response(status = 401)]
    Unauthorized(String),
    #[response(status = 404)]
    NotFound(String),
    #[response(status = 409)]
    Conflict(String),
    #[response(status = 500)]
    InternalServerError(String),
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub username: Option<String>,
    pub email: String,
    pub name: Option<String>,
    pub profile_picture: Option<String>,
    pub jwt: String,
}

#[derive(Serialize)]
pub enum ResponseBody {
    Message(String),
}

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Response {
    pub body: ResponseBody,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Claims {
    pub subject_id: i32,
    pub exp: usize,
}

#[derive(Debug, Serialize)]
pub struct Jwt {
    pub claims: Claims,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Jwt {
    type Error = NetworkResponse;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, NetworkResponse> {
        fn is_valid(key: &str) -> Result<Claims, Error> {
            Ok(decode_jwt(String::from(key))?)
        }

        match req.headers().get_one("authorization") {
            None => {
                let response = Response {
                    body: ResponseBody::Message(String::from(
                        "Error validating Jwt token - No token provided",
                    )),
                };

                Outcome::Failure((
                    Status::Unauthorized,
                    NetworkResponse::Unauthorized(serde_json::to_string(&response).unwrap()),
                ))
            }
            Some(key) => match is_valid(key) {
                Ok(claims) => Outcome::Success(Jwt { claims }),
                Err(err) => match &err.kind() {
                    jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
                        let response = Response {
                            body: ResponseBody::Message(format!(
                                "Error validating Jwt token - Expired Token"
                            )),
                        };

                        Outcome::Failure((
                            Status::Unauthorized,
                            NetworkResponse::Unauthorized(
                                serde_json::to_string(&response).unwrap(),
                            ),
                        ))
                    }
                    jsonwebtoken::errors::ErrorKind::InvalidToken => {
                        let response = Response {
                            body: ResponseBody::Message(format!(
                                "Error validating Jwt token - Invalid Token"
                            )),
                        };

                        Outcome::Failure((
                            Status::Unauthorized,
                            NetworkResponse::Unauthorized(
                                serde_json::to_string(&response).unwrap(),
                            ),
                        ))
                    }
                    _ => {
                        let response = Response {
                            body: ResponseBody::Message(format!(
                                "Error validating Jwt token - {}",
                                err
                            )),
                        };

                        Outcome::Failure((
                            Status::Unauthorized,
                            NetworkResponse::Unauthorized(
                                serde_json::to_string(&response).unwrap(),
                            ),
                        ))
                    }
                },
            },
        }
    }
}

#[derive(Deserialize)]
pub struct GoogleAccessToken(String);

#[derive(Deserialize)]
pub struct GoogleUserInfo {
    pub email: String,
}

#[derive(serde::Deserialize)]
pub struct AccessToken {
    pub token: String,
}

#[derive(Debug)]
pub enum UserError {
    EmailAlreadyInUse,
    NotFound,
    HashingError(String),
    DatabaseError(diesel::result::Error),
}

impl From<diesel::result::Error> for UserError {
    fn from(err: diesel::result::Error) -> Self {
        UserError::DatabaseError(err)
    }
}

impl std::fmt::Display for UserError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            UserError::EmailAlreadyInUse => write!(f, "Email is already in use"),
            UserError::NotFound => write!(f, "User not found"),
            UserError::HashingError(err) => write!(f, "Hashing error: {}", err),
            UserError::DatabaseError(err) => write!(f, "Database error: {}", err),
        }
    }
}

impl std::error::Error for UserError {}

lazy_static! {
    // Username can only contain alphanumeric characters
    static ref USERNAME_REGEX: Regex = Regex::new(r"^[a-zA-Z0-9]+$").unwrap();
}
// Password must be at least 6 characters long and contain at least one letter and one number. Can also contain special characters
fn validate_password(password: &str) -> Result<(), ValidationError> {
    let has_letter = password.chars().any(|c| c.is_alphabetic());
    let has_number = password.chars().any(|c| c.is_numeric());
    let has_special_char = password.chars().any(|c| "!@#$%^&*".contains(c));

    if has_letter
        && has_number
        && (has_special_char || password.chars().all(|c| c.is_alphanumeric()))
    {
        Ok(())
    } else {
        Err(ValidationError::new("Password requirements not met"))
    }
}
