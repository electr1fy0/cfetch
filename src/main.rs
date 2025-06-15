use reqwest;
use serde::Deserialize;
use std::env;

#[derive(Deserialize, Debug)]
struct RatingResponse {
    status: String,
    result: Vec<RatingData>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RatingData {
    contest_id: i32,
    contest_name: String,
    rank: i32,
    handle: String,
    old_rating: i32,
    new_rating: i32,
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 3 {
        todo!();
    }

    if args[1] == "--history" || args[1] == "-h" {
        let handle = &args[2];

        match get_rating_history(handle) {
            Ok(res) => print_rating_history(res),
            Err(e) => println!("{e}"),
        }
    }
}

fn get_rating_history(handle: &str) -> Result<RatingResponse, Box<dyn std::error::Error>> {
    let url = format!("https://codeforces.com/api/user.rating?handle={}", handle);
    let res = reqwest::blocking::get(url)?.json::<RatingResponse>()?;

    if res.status == "FAILED" {
        return Err("API screwed something.".into());
    } else if res.result.is_empty() {
        return Err("No such user".into());
    }
    Ok(res)
}

fn print_rating_history(response: RatingResponse) {
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
