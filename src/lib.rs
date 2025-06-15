use serde::Deserialize;

use chrono::{DateTime, FixedOffset};

#[derive(Deserialize)]
pub struct ContestResponse {
    pub status: String,
    pub result: Vec<ContestData>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContestData {
    pub id: i32,
    pub name: String,
    pub phase: String,
    pub start_time_seconds: i32,
}

#[derive(Deserialize, Debug)]
pub struct RatingResponse {
    pub status: String,
    pub result: Vec<RatingData>,
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
pub struct UserResponse {
    pub status: String,
    pub result: Vec<UserData>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UserData {
    pub rank: String,
    pub handle: String,
    pub max_rating: i32,
    pub rating: i32,
}

pub fn get_rating_history(handle: &str) -> Result<RatingResponse, Box<dyn std::error::Error>> {
    let url = format!("https://codeforces.com/api/user.rating?handle={}", handle);
    let res = reqwest::blocking::get(url)?.json::<RatingResponse>()?;

    if res.status == "FAILED" {
        return Err("API screwed something.".into());
    } else if res.result.is_empty() {
        return Err("No such user".into());
    }
    Ok(res)
}

pub fn get_user_info(handle: &str) -> Result<UserResponse, Box<dyn std::error::Error>> {
    let url = format!(
        "https://codeforces.com/api/user.info?handles={}&checkHistoricHandles=false",
        handle
    );

    let res = reqwest::blocking::get(url)?.json::<UserResponse>()?;

    if res.status == "FAILED" {
        return Err("API screwed something.".into());
    } else if res.result.is_empty() {
        return Err("No such user".into());
    }
    Ok(res)
}

pub fn print_rating_history(response: RatingResponse) {
    let repeat_count = 119;
    println!("\n User: {}", response.result[0].handle);
    println!("{}", "-".repeat(repeat_count));
    // for i in 0..response.result.len() {
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

pub fn print_user_info(response: UserResponse) {
    let repeat_count = 73;
    println!("{}", "-".repeat(repeat_count));
    println!(
        "| {:<20} | {:<20} | {:>10} | {:>10} |",
        "Handle", "Rank", "Rating", "Max Rating"
    );
    // println!("{}", "-".repeat(repeat_count));
    for user in response.result {
        println!(
            "| {:<20} | {:<20} | {:>10} | {:>10} |",
            user.handle, user.rank, user.rating, user.max_rating
        );
    }
    println!("{}", "-".repeat(repeat_count));
}

pub fn get_contests() -> Result<ContestResponse, Box<dyn std::error::Error>> {
    let url = " https://codeforces.com/api/contest.list?gym=false";
    let res = reqwest::blocking::get(url)?.json::<ContestResponse>()?;
    Ok(res)
}

pub fn print_contests(response: ContestResponse) {
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
