use clap::Parser;

#[derive(Parser, Debug)]
#[command(

    version,
    about,
    long_about = None,
)]
pub struct Args {
    #[arg(short = 'r', long)]
    pub rating: Option<String>,

    #[arg(short, long)]
    pub info: Option<String>,
}
