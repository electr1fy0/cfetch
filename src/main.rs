use cfetch::print_submission_history;
use clap::Parser;

mod args;
use args::Args;
use cfetch::printers::*;

fn main() {
    let args = Args::parse();

    if let Some(handle) = args.rating {
        match cfetch::get_rating_history(&handle) {
            Ok(res) => print_rating_history(res),
            Err(e) => println!("{e}"),
        }
    } else if let Some(handle) = args.info {
        match cfetch::get_user_info(&handle) {
            Ok(res) => print_user_info(res),
            Err(e) => println!("{e}"),
        }
    } else if let Some(handle) = args.submissions {
        match cfetch::get_submission_history(&handle) {
            Ok(res) => print_submission_history(res),
            Err(e) => println!("{e}"),
        }
    } else if args.contests {
        match cfetch::get_contests() {
            Ok(res) => print_contests(res),
            Err(e) => println!("{e}"),
        };
    }
}
