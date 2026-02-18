package model

import "time"

type Language string

const (
	LanguageCPP    Language = "cpp17"
	LanguagePython Language = "python311"
	LanguageJava   Language = "java17"
)

type Status string

const (
	StatusQueued    Status = "queued"
	StatusCompiling Status = "compiling"
	StatusRunning   Status = "running"
	StatusDone      Status = "done"
)

type Verdict string

const (
	VerdictPending Verdict = "PENDING"
	VerdictAC      Verdict = "AC"
	VerdictWA      Verdict = "WA"
	VerdictTLE     Verdict = "TLE"
	VerdictMLE     Verdict = "MLE"
	VerdictRE      Verdict = "RE"
	VerdictCE      Verdict = "CE"
)

type CreateSubmissionRequest struct {
	Language       Language `json:"language"`
	SourceCode     string   `json:"sourceCode"`
	Input          string   `json:"input"`
	ExpectedOutput string   `json:"expectedOutput"`
	TimeLimitMs    int      `json:"timeLimitMs"`
	MemoryLimitMB  int      `json:"memoryLimitMb"`
	MaxOutputBytes int      `json:"maxOutputBytes"`
}

type Submission struct {
	ID             string    `json:"id"`
	Language       Language  `json:"language"`
	SourceCode     string    `json:"-"`
	Input          string    `json:"-"`
	ExpectedOutput string    `json:"-"`
	TimeLimitMs    int       `json:"timeLimitMs"`
	MemoryLimitMB  int       `json:"memoryLimitMb"`
	MaxOutputBytes int       `json:"maxOutputBytes"`
	Status         Status    `json:"status"`
	Verdict        Verdict   `json:"verdict"`
	CompileLog     string    `json:"compileLog,omitempty"`
	RuntimeLog     string    `json:"runtimeLog,omitempty"`
	Output         string    `json:"output,omitempty"`
	RuntimeMs      int64     `json:"runtimeMs"`
	MemoryKB       int64     `json:"memoryKb"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Event struct {
	SubmissionID string    `json:"submissionId"`
	Status       Status    `json:"status"`
	Verdict      Verdict   `json:"verdict"`
	RuntimeMs    int64     `json:"runtimeMs"`
	At           time.Time `json:"at"`
	Message      string    `json:"message,omitempty"`
}
