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
    .multiple(false)
    .args(&["rating", "info", "contests", "submissions" ])))]
pub struct Args {
    #[arg(short, long)]
    pub rating: Option<String>,

    #[arg(short, long)]
    pub info: Option<String>,

    #[arg(short, long)]
    pub contests: bool,

    #[arg(short, long)]
    pub submissions: Option<String>,
    #[arg(short, long)]
    pub problem: Option<String>,
}
