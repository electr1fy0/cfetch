use clap::Parser;

mod args;
use args::Args;

fn main() {
    let args = Args::parse();

    match (args.rating, args.info) {
        (Some(handle), None) => match cfetch::get_rating_history(&handle) {
            Ok(res) => cfetch::print_rating_history(res),
            Err(e) => println!("{e}"),
        },
        (None, Some(handle)) => match cfetch::get_user_info(&handle) {
            Ok(res) => cfetch::print_user_info(res),
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
