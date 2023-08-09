use crate::models::*;
use crate::schema::weight_progress;
use crate::LogsDbConn;
use chrono::Utc;
use diesel::prelude::*;
use rocket::serde::json::Json;

#[post("/weight-data/create", data = "<weight_data>")]
pub async fn create_weight_data(
    conn: LogsDbConn,
    key: Result<Jwt, NetworkResponse>,
    weight_data: Json<WeightDTO>,
) -> Result<NetworkResponse, NetworkResponse> {
    let user_id = match key {
        Ok(k) => k.claims.subject_id,
        Err(_) => return Err(NetworkResponse::Unauthorized("Unauthorized".to_string())),
    };

    let date = weight_data.date.unwrap_or_else(|| Utc::now().date_naive());

    let new_weight_data = NewWeight {
        user_id,
        weight: weight_data.weight,
        date,
    };

    match conn
        .run(move |c| {
            diesel::insert_into(weight_progress::table)
                .values(&new_weight_data)
                .on_conflict((weight_progress::user_id, weight_progress::date))
                .do_update()
                .set(&new_weight_data)
                .execute(c)
        })
        .await
    {
        Ok(_) => Ok(NetworkResponse::Ok(
            "Weight data created or updated".to_string(),
        )),
        Err(err) => Err(NetworkResponse::InternalServerError(err.to_string())),
    }
}

#[get("/weight-data")]
pub async fn get_weight_data(
    conn: LogsDbConn,
    key: Result<Jwt, NetworkResponse>,
) -> Result<Json<ChartResponse>, NetworkResponse> {
    let user_id = key?.claims.subject_id;

    let weight_data: Vec<WeightProgress> = match conn
        .run(move |c| {
            weight_progress::table
                .filter(weight_progress::user_id.eq(&user_id))
                .load::<WeightProgress>(c)
        })
        .await
    {
        Ok(result) => result,
        Err(err) => {
            return Err(NetworkResponse::InternalServerError(format!(
                "Database error: {}",
                err
            )))
        }
    };

    let data_points: Vec<DataPoint> = weight_data
        .iter()
        .map(|w| DataPoint {
            date: w.date.format("%d %b").to_string(),
            weight: w.weight,
        })
        .collect();

    Ok(Json(ChartResponse { data_points }))
}
