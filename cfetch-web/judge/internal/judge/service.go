package judge

import (
	"context"
	"errors"
	"fmt"
	"judge/internal/model"
	"judge/internal/store"
	"strings"
	"time"
)

type Service struct {
	store  *store.MemoryStore
	runner Runner
	jobs   chan string
}

func NewService(s *store.MemoryStore, r Runner, queueSize int) *Service {
	if queueSize < 1 {
		queueSize = 128
	}
	return &Service{store: s, runner: r, jobs: make(chan string, queueSize)}
}

func (s *Service) StartWorkers(ctx context.Context, n int) {
	if n < 1 {
		n = 1
	}
	for i := 0; i < n; i++ {
		go s.worker(ctx)
	}
}

func (s *Service) worker(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case id := <-s.jobs:
			s.process(id)
		}
	}
}

func (s *Service) Submit(req model.CreateSubmissionRequest) (model.Submission, error) {
	if err := validate(req); err != nil {
		return model.Submission{}, err
	}

	now := time.Now().UTC()
	sub := model.Submission{
		ID:             newID(),
		Language:       req.Language,
		SourceCode:     req.SourceCode,
		Input:          req.Input,
		ExpectedOutput: req.ExpectedOutput,
		TimeLimitMs:    req.TimeLimitMs,
		MemoryLimitMB:  req.MemoryLimitMB,
		MaxOutputBytes: req.MaxOutputBytes,
		Status:         model.StatusQueued,
		Verdict:        model.VerdictPending,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	created := s.store.Create(sub)
	s.jobs <- created.ID
	return created, nil
}

func (s *Service) Get(id string) (model.Submission, error) {
	return s.store.Get(id)
}

func (s *Service) Subscribe(id string) (<-chan model.Event, func(), error) {
	if _, err := s.store.Get(id); err != nil {
		return nil, nil, err
	}
	ch, cancel := s.store.Subscribe(id)
	return ch, cancel, nil
}

func (s *Service) process(id string) {
	sub, err := s.store.Get(id)
	if err != nil {
		return
	}

	if sub.Language == model.LanguageCPP || sub.Language == model.LanguageJava {
		_, _ = s.store.Update(id, func(su *model.Submission) {
			su.Status = model.StatusCompiling
		})
		compileLog, cerr := s.runner.Compile(sub)
		if cerr != nil {
			_, _ = s.store.Update(id, func(su *model.Submission) {
				su.Status = model.StatusDone
				su.Verdict = model.VerdictCE
				su.CompileLog = compileLog
			})
			return
		}
		if compileLog != "" {
			_, _ = s.store.Update(id, func(su *model.Submission) {
				su.CompileLog = compileLog
			})
		}
	}

	_, _ = s.store.Update(id, func(su *model.Submission) {
		su.Status = model.StatusRunning
	})

	res, rerr := s.runner.Run(sub)
	if rerr != nil {
		_, _ = s.store.Update(id, func(su *model.Submission) {
			su.Status = model.StatusDone
			su.Verdict = model.VerdictRE
			su.RuntimeLog = rerr.Error()
		})
		return
	}

	verdict := model.VerdictAC
	if res.TimedOut {
		verdict = model.VerdictTLE
	} else if res.ExitCode != 0 {
		verdict = model.VerdictRE
	} else if !outputEqual(res.Stdout, sub.ExpectedOutput) {
		verdict = model.VerdictWA
	}

	_, _ = s.store.Update(id, func(su *model.Submission) {
		su.Status = model.StatusDone
		su.Verdict = verdict
		su.Output = res.Stdout
		su.RuntimeLog = res.Stderr
		su.RuntimeMs = res.RuntimeMs
		su.MemoryKB = res.MemoryKB
	})
}

func outputEqual(actual, expected string) bool {
	norm := func(v string) string {
		v = strings.ReplaceAll(v, "\r\n", "\n")
		parts := strings.Split(v, "\n")
		for i := range parts {
			parts[i] = strings.TrimRight(parts[i], " \t")
		}
		return strings.TrimSpace(strings.Join(parts, "\n"))
	}
	return norm(actual) == norm(expected)
}

func validate(req model.CreateSubmissionRequest) error {
	if req.SourceCode == "" {
		return errors.New("sourceCode is required")
	}
	switch req.Language {
	case model.LanguageCPP, model.LanguagePython, model.LanguageJava:
	default:
		return fmt.Errorf("unsupported language: %s", req.Language)
	}
	if req.TimeLimitMs <= 0 {
		req.TimeLimitMs = 2000
	}
	if req.MemoryLimitMB <= 0 {
		req.MemoryLimitMB = 256
	}
	if req.MaxOutputBytes <= 0 {
		req.MaxOutputBytes = 128 * 1024
	}
	return nil
}

func newID() string {
	return fmt.Sprintf("sub_%d", time.Now().UnixNano())
}
