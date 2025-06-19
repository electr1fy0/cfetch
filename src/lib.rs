use chrono::{DateTime, FixedOffset};
use comfy_table::Table;
pub mod printers;
// use prettytable::{Cell, Row, Table};
use serde::{Deserialize, de::DeserializeOwned};

// Parent struct for all API requests
#[derive(Deserialize, Debug)]
pub struct APIResponse<T> {
    pub status: String,
    pub result: Vec<T>,
}

// Child Structs:
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContestData {
    pub id: i32,
    pub name: String,
    pub phase: String,
    pub start_time_seconds: i32,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RatingData {
    pub contest_id: i32,
    pub contest_name: String,
    pub rank: i32,
    pub handle: String,
    pub old_rating: i32,
    pub new_rating: i32,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UserData {
    pub rank: String,
    pub handle: String,
    pub max_rating: i32,
    pub rating: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmissionData {
    pub contest_id: i32,
    pub creation_time_seconds: i32,
    pub problem: Problem,
    pub verdict: String,
    pub programming_language: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Problem {
    pub name: String,
    pub index: String,
    pub rating: Option<i32>,
}

// Make all API requests
pub fn make_request<T>(url: &str) -> Result<T, Box<dyn std::error::Error>>
where
    T: DeserializeOwned,
{
    let res = reqwest::blocking::get(url)?.json::<T>()?;

    Ok(res)
}

// Get type inferred requests and do whatever with them, (to improve)
pub fn get_submission_history(
    handle: &str,
) -> Result<APIResponse<SubmissionData>, Box<dyn std::error::Error>> {
    let url = format!(
        " https://codeforces.com/api/user.status?handle={}&from=1&count=10",
        handle
    );
    return make_request(&url);
}

pub fn print_submission_history(response: APIResponse<SubmissionData>) {
    println!();
    let mut table = Table::new();
    table.set_header(vec![
        "Contest ID",
        "Difficulty",
        "Problem Name",
        "Verdict",
        "Language",
        "Time (IST)",
    ]);

    for sub in response.result {
        let utc_time = DateTime::from_timestamp(sub.creation_time_seconds as i64, 0).unwrap();
        let offset = FixedOffset::east_opt(5 * 3600 + 60 * 30).unwrap();
        let ist_time = utc_time
            .with_timezone(&offset)
            .format("%d-%m-%Y %H-%M")
            .to_string();

        let difficulty: String;
        match &sub.problem.rating {
            Some(value) => difficulty = format!("{} ({})", &sub.problem.index, value),
            None => difficulty = format!("{}: (NA)", &sub.problem.index),
        }
        table.add_row(vec![
            &sub.contest_id.to_string(),
            &difficulty,
            &sub.problem.name,
            &sub.verdict,
            &sub.programming_language,
            &ist_time,
        ]);
    }
    println!("{table}");
}

pub fn get_rating_history(
    handle: &str,
) -> Result<APIResponse<RatingData>, Box<dyn std::error::Error>> {
    let url = format!("https://codeforces.com/api/user.rating?handle={}", handle);
    // let response: RatingResponse<RatingData> = make_request(&url)?;
    // Ok(response)
    return make_request(&url);
}

pub fn get_user_info(handle: &str) -> Result<APIResponse<UserData>, Box<dyn std::error::Error>> {
    let url = format!(
        "https://codeforces.com/api/user.info?handles={}&checkHistoricHandles=false",
        handle
    );
    return make_request(&url);
}

pub fn get_contests() -> Result<APIResponse<ContestData>, Box<dyn std::error::Error>> {
    let url = " https://codeforces.com/api/contest.list?gym=false";
    return make_request(&url);
}
