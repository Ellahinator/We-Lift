use crate::jwt::decode_jwt;
use crate::schema::users;
use chrono::NaiveDateTime;
use rocket::serde::{Deserialize, Serialize};

#[derive(Queryable)]
#[serde(crate = "rocket::serde")]
pub struct User {
    pub id: i32,
    pub username: Option<String>,
    pub email: String,
    pub password_hash: String,
    pub created_at: NaiveDateTime,
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

#[derive(Debug, Deserialize, Serialize)]
pub struct Claims {
    pub subject_id: i32,
    exp: usize
}

#[derive(Debug)]
pub struct JWT {
    pub claims: Claims
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
