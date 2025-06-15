# cfetch

**Status:** Work in Progress (WIP)

`cfetch` is a minimal command-line tool written in Rust that provides quick access to Codeforces user data. Currently, it supports fetching and displaying a user's contest rating history.

Planned as a lightweight toolkit for various Codeforces utilities.


## Usage

### Prerequisites
Rust must be installed:
```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Build
```sh
cargo build --release
```

### Run
```sh
./target/release/cfetch -h <handle> # (for example)
```

## Usage

| Option             | Shorthand | Argument Type | Description                       |
|--------------------|-----------|----------------|-----------------------------------|
| `--rating`         | `-r`      | `<handle>`     | Print rating history              |
| `--info`           | `-i`      | `<handle>`     | Print user's profile information  |
| `--contests`       | `-c`      | None           | Show latest Codeforces contests   |
| `--help`           | `-h`      | None           | Show help message                 |
| `--version`        | `-V`      | None           | Show version                      |
---
This is an early prototype.
