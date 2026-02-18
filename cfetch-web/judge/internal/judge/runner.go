package judge

import "judge/internal/model"

type RunResult struct {
	Stdout    string
	Stderr    string
	RuntimeMs int64
	MemoryKB  int64
	TimedOut  bool
	ExitCode  int
}

type Runner interface {
	Compile(sub model.Submission) (string, error)
	Run(sub model.Submission) (RunResult, error)
}
