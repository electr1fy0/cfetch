use clap::Parser;
use reqwest;
use serde::Deserialize;
use std::env;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short = 'r', long)]
    rating: Option<String>,
    #[arg(short, long)]
    info: Option<String>,

    #[arg(short, long, default_value_t = 1)]
    count: u8,
}

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

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct UserResponse {
    status: String,
    result: Vec<UserData>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]

struct UserData {
    rank: String,
    handle: String,
    max_rating: i32,
    rating: i32,
}

fn main() {
    // let args: Vec<String> = env::args().collect();

    // if args.len() < 3 {
    //     todo!();
    // }

    let args = Args::parse();

    let args = Args::parse();

    match (args.rating, args.info) {
        (Some(handle), None) => match get_rating_history(&handle) {
            Ok(res) => print_rating_history(res),
            Err(e) => println!("{e}"),
        },
        (None, Some(handle)) => match get_user_info(&handle) {
            Ok(res) => print_user_info(res),
            Err(e) => println!("{e}"),
        },
        (Some(_), Some(_)) => {
            eprintln!("Can't use both together.");
            std::process::exit(1); // Double colon, not single
        }
        (None, None) => {
            eprintln!("Provide either --history or --info");
            std::process::exit(1);
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

fn get_user_info(handle: &str) -> Result<UserResponse, Box<dyn std::error::Error>> {
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

fn print_user_info(response: UserResponse) {
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
