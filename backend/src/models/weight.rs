use crate::schema::weight_progress;
use chrono::NaiveDate;
use diesel::{AsChangeset, Identifiable, Insertable, Queryable};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Queryable, Insertable, Identifiable, AsChangeset)]
#[diesel(table_name = weight_progress)]
pub struct WeightProgress {
    pub id: i32,
    pub user_id: i32,
    pub weight: f64,
    pub date: NaiveDate,
}

#[derive(Insertable, AsChangeset)]
#[diesel(table_name = weight_progress)]
pub struct NewWeight {
    pub user_id: i32,
    pub weight: f64,
    pub date: NaiveDate,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WeightDTO {
    pub weight: f64,
    pub date: Option<NaiveDate>,
}

#[derive(Serialize, Validate)]
pub struct DataPoint {
    pub date: String,
    #[validate(range(min = 1, max = 1000))]
    pub weight: f64,
}

#[derive(Serialize)]
pub struct ChartResponse {
    pub data_points: Vec<DataPoint>,
}
