use clap::{ArgGroup, Parser};

#[derive(Parser, Debug)]
#[command(
    version,
    about,
    long_about = None,
)]
#[command(group(
    ArgGroup::new("mode")
    .required(true)
    .args(&["rating", "info", "contests"])))]
pub struct Args {
    #[arg(short, long)]
    pub rating: Option<String>,

    #[arg(short, long)]
    pub info: Option<String>,

    #[arg(short, long)]
    pub contests: bool,
}
