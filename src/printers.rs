use crate::*;
use comfy_table::Table;

pub fn print_rating_history(response: APIResponse<RatingData>) {
    let mut table = Table::new();
    table.set_header(vec![
        "Contest ID",
        "Title",
        "Rank",
        "Old Rating",
        "New Rating",
    ]);

    for entry in &response.result {
        table.add_row(vec![
            &entry.contest_id.to_string(),
            &entry.contest_name,
            &entry.rank.to_string(),
            &entry.old_rating.to_string(),
            &entry.new_rating.to_string(),
        ]);
    }
    println!("{table}");
}

pub fn print_user_info(response: APIResponse<UserData>) {
    let mut table = Table::new();
    table.set_header(vec!["Handle", "Rank", "Rating", "Max Rating"]);

    for user in response.result {
        table.add_row(vec![
            user.handle,
            user.rank,
            user.rating.to_string(),
            user.max_rating.to_string(),
        ]);
    }
    println!("{table}");
}

pub fn print_contests(response: APIResponse<ContestData>) {
    let mut table = Table::new();
    table.set_header(vec!["Contest ID", "Title", "Start Time (IST)"]);

    for i in 0..15 {
        let contest = &response.result[i];
        let utc_time = DateTime::from_timestamp(contest.start_time_seconds as i64, 0).unwrap();
        let offset = FixedOffset::east_opt(5 * 3600 + 30 * 60).unwrap();
        let local_time = utc_time.with_timezone(&offset);

        let time = local_time.format("%d-%m-%Y %H:%M").to_string();
        table.add_row(vec![contest.id.to_string(), contest.name.to_string(), time]);
    }
    println!("{table}");
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
