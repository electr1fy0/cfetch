package judge

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"judge/internal/model"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"
)

type DockerRunner struct{}

func NewDockerRunner() *DockerRunner { return &DockerRunner{} }

func (r *DockerRunner) Compile(sub model.Submission) (string, error) {
	dir, err := os.MkdirTemp("", "cfetch-judge-compile-*")
	if err != nil {
		return "", err
	}
	defer os.RemoveAll(dir)

	srcPath, cmdStr, image, err := writeSourceAndCompileCommand(dir, sub)
	_ = srcPath
	if err != nil {
		return "", err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	memory := strconv.Itoa(max(128, sub.MemoryLimitMB)) + "m"
	args := []string{
		"run", "--rm", "--network", "none",
		"--memory", memory,
		"--cpus", "1.0",
		"--pids-limit", "128",
		"-v", dir + ":/workspace",
		"-w", "/workspace",
		image,
		"sh", "-lc", cmdStr,
	}

	cmd := exec.CommandContext(ctx, "docker", args...)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	err = cmd.Run()
	if ctx.Err() == context.DeadlineExceeded {
		return out.String(), errors.New("compile timeout")
	}
	if err != nil {
		return out.String(), err
	}
	return out.String(), nil
}

func (r *DockerRunner) Run(sub model.Submission) (RunResult, error) {
	dir, err := os.MkdirTemp("", "cfetch-judge-run-*")
	if err != nil {
		return RunResult{}, err
	}
	defer os.RemoveAll(dir)

	_, runCommand, image, err := writeSourceAndRunCommand(dir, sub)
	if err != nil {
		return RunResult{}, err
	}

	timeLimit := time.Duration(max(500, sub.TimeLimitMs)+250) * time.Millisecond
	ctx, cancel := context.WithTimeout(context.Background(), timeLimit)
	defer cancel()

	memory := strconv.Itoa(max(128, sub.MemoryLimitMB)) + "m"
	args := []string{
		"run", "--rm", "--network", "none",
		"--memory", memory,
		"--cpus", "1.0",
		"--pids-limit", "128",
		"--read-only",
		"--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
		"-v", dir + ":/workspace",
		"-w", "/workspace",
		image,
		"sh", "-lc", runCommand,
	}

	cmd := exec.CommandContext(ctx, "docker", args...)
	cmd.Stdin = bytes.NewBufferString(sub.Input)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	started := time.Now()
	err = cmd.Run()
	runtimeMs := time.Since(started).Milliseconds()

	result := RunResult{
		Stdout:    truncate(stdout.String(), max(1024, sub.MaxOutputBytes)),
		Stderr:    truncate(stderr.String(), 16*1024),
		RuntimeMs: runtimeMs,
		MemoryKB:  0,
		ExitCode:  0,
	}

	if ctx.Err() == context.DeadlineExceeded {
		result.TimedOut = true
		result.ExitCode = 124
		return result, nil
	}
	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			result.ExitCode = exitErr.ExitCode()
			return result, nil
		}
		return result, err
	}
	return result, nil
}

func writeSourceAndCompileCommand(dir string, sub model.Submission) (string, string, string, error) {
	switch sub.Language {
	case model.LanguageCPP:
		src := filepath.Join(dir, "main.cpp")
		if err := os.WriteFile(src, []byte(sub.SourceCode), 0o644); err != nil {
			return "", "", "", err
		}
		return src, "g++ -std=c++17 -O2 -pipe -o app main.cpp", "gcc:13", nil
	case model.LanguageJava:
		src := filepath.Join(dir, "Main.java")
		if err := os.WriteFile(src, []byte(sub.SourceCode), 0o644); err != nil {
			return "", "", "", err
		}
		return src, "javac Main.java", "eclipse-temurin:17", nil
	default:
		return "", "", "", fmt.Errorf("compile not supported for language %s", sub.Language)
	}
}

func writeSourceAndRunCommand(dir string, sub model.Submission) (string, string, string, error) {
	switch sub.Language {
	case model.LanguageCPP:
		src := filepath.Join(dir, "main.cpp")
		if err := os.WriteFile(src, []byte(sub.SourceCode), 0o644); err != nil {
			return "", "", "", err
		}
		return src, "g++ -std=c++17 -O2 -pipe -o app main.cpp >/dev/null 2>&1 && ./app", "gcc:13", nil
	case model.LanguagePython:
		src := filepath.Join(dir, "main.py")
		if err := os.WriteFile(src, []byte(sub.SourceCode), 0o644); err != nil {
			return "", "", "", err
		}
		return src, "python3 main.py", "python:3.11-alpine", nil
	case model.LanguageJava:
		src := filepath.Join(dir, "Main.java")
		if err := os.WriteFile(src, []byte(sub.SourceCode), 0o644); err != nil {
			return "", "", "", err
		}
		return src, "javac Main.java >/dev/null 2>&1 && java Main", "eclipse-temurin:17", nil
	default:
		return "", "", "", fmt.Errorf("unsupported language %s", sub.Language)
	}
}

func truncate(s string, limit int) string {
	if len(s) <= limit {
		return s
	}
	return s[:limit]
}
