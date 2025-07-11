package model

import (
	"fmt"
	"os"
	"sort"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/electr1fy0/cfetch/cmd"
	"github.com/electr1fy0/cfetch/data"
)

func InitialModel() model {
	ti := textinput.New()
	ti.Placeholder = "eg. tourist"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 20

	s := spinner.New()
	s.Spinner = spinner.Dot

	var page screen
	if cmd.Handle != "" {
		page = Loading
	}
	return model{
		state:                 page,
		textinput:             ti,
		info:                  table.New(),
		contests:              table.New(),
		ratingTable:           table.New(),
		contestSubmissions:    table.New(),
		submission:            table.New(),
		err:                   nil,
		handle:                cmd.Handle,
		spinner:               s,
		score:                 0,
		ratingPlot:            "",
		ratingData:            nil,
		contestSubmissionList: nil,
		contestList:           nil,
		submissionList:        nil,
	}
}

func (m model) Init() tea.Cmd {
	return textinput.Blink
}

func getUserData(handle string) tea.Cmd {
	return func() tea.Msg {
		infoTable, _ := data.GetUserInfo(handle)
		ratingTable, ratingData, ratingPlot := data.GetRatingHistory(handle)
		submissionTable, submissionList, submissionPlot := data.GetSubmissionHistory(handle)
		contestsTable, contestList := data.GetContests()

		return loadedMsg{
			info:                  infoTable,
			ratingTable:           ratingTable,
			ratingPlot:            ratingPlot,
			submission:            submissionTable,
			contests:              contestsTable,
			ratingData:            ratingData,
			submissionPlot:        submissionPlot,
			submissionList:        submissionList,
			contestList:           contestList,
			contestSubmissionList: nil,
		}
	}
}

func (m model) calculateScore(id int) (int, int) {
	var contestStart, contestEnd, contestDuration int64

	for _, c := range m.contestList {
		if c.ID == id {
			contestStart = c.StartTimeSeconds
			contestDuration = c.DurationSeconds
			contestEnd = contestStart + contestDuration
			break
		}
	}

	if contestDuration == 0 {
		return 0, 0
	}

	problemMap := map[string]*ProblemResult{}

	for _, sub := range m.contestSubmissionList {
		if sub.CreationTimeSeconds < contestStart || sub.CreationTimeSeconds > contestEnd {
			continue
		}

		key := fmt.Sprintf("%s%d", sub.Problem.Index, sub.Problem.ContestID)

		if _, ok := problemMap[key]; !ok {
			problemMap[key] = &ProblemResult{Problem: sub.Problem}
		}
		problemMap[key].Submissions = append(problemMap[key].Submissions, sub)
	}

	total, maxTotal := 0, 0

	for _, prob := range problemMap {
		sort.Slice(prob.Submissions, func(i, j int) bool {
			return prob.Submissions[i].CreationTimeSeconds < prob.Submissions[j].CreationTimeSeconds
		})

		score := 0
		base := 500
		if prob.Problem.Rating != nil {
			base = *prob.Problem.Rating
		}
		maxTotal += base

		for i, sub := range prob.Submissions {
			if sub.Verdict == "OK" {
				solveTime := sub.CreationTimeSeconds - contestStart
				wrongs := i // count before AC

				timePenalty := (solveTime / 60) * 2
				wrongPenalty := int64(wrongs * 50)

				points := int64(base) - timePenalty - wrongPenalty
				if points > 0 {
					score = int(points)
				}
				break
			}
		}
		total += score
	}

	return total, maxTotal
}

type ProblemResult struct {
	Problem       data.Problem
	Submissions   []data.Submission
	Solved        bool
	SolveTime     int64
	WrongAttempts int
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEnter:
			m.handle = m.textinput.Value()
			m.state = Loading
			return m, tea.Batch(m.spinner.Tick, getUserData(m.handle))
		case tea.KeyEscape:
			return m, tea.Quit
		case tea.KeyTab:
			m.state = ContestAnalysis
			return m, cmd
		case tea.KeySpace:
			if m.state == Dashboard {
				cursor := m.ratingTable.Cursor()
				if cursor >= 0 && cursor < len(m.ratingData) {
					selectedContestId := m.ratingData[cursor].ContestID
					m.contestSubmissions, m.contestSubmissionList = data.GetContestSubmissions(selectedContestId, m.handle)
					m.score, m.maxScore = m.calculateScore(selectedContestId)
					m.state = ContestAnalysis
				}
			}
			return m, cmd
		}
	case loadedMsg:
		m.info = msg.info
		m.ratingTable = msg.ratingTable
		m.ratingData = msg.ratingData

		m.ratingPlot = msg.ratingPlot
		m.submission = msg.submission
		m.contests = msg.contests
		m.state = Dashboard
		m.contestList = msg.contestList
		m.submissionPlot = msg.submissionPlot
		return m, nil
	case spinner.TickMsg:
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	}

	m.ratingTable, cmd = m.ratingTable.Update(msg)
	m.textinput, cmd = m.textinput.Update(msg)
	return m, cmd
}

func Execute() {
	p := tea.NewProgram(InitialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}
