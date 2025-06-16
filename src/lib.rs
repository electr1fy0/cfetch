use chrono::{DateTime, FixedOffset};
use prettytable::{Cell, Row, Table};
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
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Problem {
    pub name: String,
    pub index: String,
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
    table.add_row(Row::new(vec![
        Cell::new("Contest ID"),
        Cell::new("Index"),
        Cell::new("Problem Name"),
        Cell::new("Verdict"),
        Cell::new("Time (IST)"),
    ]));

    for sub in response.result {
        let utc_time = DateTime::from_timestamp(sub.creation_time_seconds as i64, 0).unwrap();
        let offset = FixedOffset::east_opt(5 * 3600 + 60 * 30).unwrap();
        let ist_time = utc_time
            .with_timezone(&offset)
            .format("%d-%m-%Y %H-%M")
            .to_string();

        table.add_row(Row::new(vec![
            Cell::new(&sub.contest_id.to_string()),
            Cell::new(&sub.problem.index),
            Cell::new(&sub.problem.name),
            Cell::new(&sub.verdict),
            Cell::new(&ist_time),
        ]));
    }

    table.printstd();
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

pub fn print_rating_history(response: APIResponse<RatingData>) {
    let repeat_count = 119;
    println!("\n User: {}", response.result[0].handle);
    println!("{}", "-".repeat(repeat_count));
    println!(
        "| {:<12} | {:<65} | {:<6} | {:>10} | {:>10} |",
        "Contest ID", "Title", "Rank", "Old Rating", "New Rating"
    );
    println!("{}", "-".repeat(repeat_count));
    // }
    for entry in &response.result {
        println!(
            "| {:<12} | {:<65} | {:<6} | {:>10} | {:>10} |",
            entry.contest_id, entry.contest_name, entry.rank, entry.old_rating, entry.new_rating
        );
    }
    println!("{}\n", "-".repeat(repeat_count));
}

pub fn print_user_info(response: APIResponse<UserData>) {
    let repeat_count = 73;
    println!("{}", "-".repeat(repeat_count));
    println!(
        "| {:<20} | {:<20} | {:>10} | {:>10} |",
        "Handle", "Rank", "Rating", "Max Rating"
    );
    for user in response.result {
        println!(
            "| {:<20} | {:<20} | {:>10} | {:>10} |",
            user.handle, user.rank, user.rating, user.max_rating
        );
    }
    println!("{}", "-".repeat(repeat_count));
}

pub fn print_contests(response: APIResponse<ContestData>) {
    let repeat_count = 106;
    println!("\n Latest Contests:");
    println!("{}", "-".repeat(repeat_count));
    println!(
        "| {:<10} | {:<70} | {:>16} |",
        "Contest ID", "Title", "Start Time (IST)"
    );
    println!("{}", "-".repeat(repeat_count));

    for i in 0..15 {
        let contest = &response.result[i];
        let utc_time = DateTime::from_timestamp(contest.start_time_seconds as i64, 0).unwrap();
        let offset = FixedOffset::east_opt(5 * 3600 + 30 * 60).unwrap();
        let local_time = utc_time.with_timezone(&offset);

        let time = local_time.format("%d-%m-%Y %H:%M").to_string();
        println!(
            "| {:<10} | {:<70} | {:>16} |",
            contest.id,
            contest.name.chars().take(70).collect::<String>(),
            time
        );
    }

    println!("{}\n", "-".repeat(repeat_count));
}
