package model

import (
	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
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

	return model{
		Login,
		ti,
		table.New(), table.New(), table.New(), table.New(), table.New(),
		nil, "", s, "", nil,
	}
}

func (m model) Init() tea.Cmd {
	return textinput.Blink
}

func getUserData(handle string) tea.Cmd {
	return func() tea.Msg {
		info := data.GetUserInfo(handle)
		ratingTable, ratingData, ratingPlot := data.GetRatingHistory(handle)
		submission := data.GetSubmissionHistory(handle)
		contests := data.GetContests()

		return loadedMsg{
			info,
			ratingTable,
			ratingData,
			ratingPlot,
			submission,
			contests,
		}
	}
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
				m.ratingTable, cmd = m.ratingTable.Update(msg)
				if cursor >= 0 && cursor < len(m.ratingData) {
					selectedContestId := m.ratingData[cursor].ContestID
					m.contestSubmissions = data.GetContestSubmissions(selectedContestId, m.handle)
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
		return m, nil
	case spinner.TickMsg:
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	}

	m.ratingTable, cmd = m.ratingTable.Update(msg)
	m.textinput, cmd = m.textinput.Update(msg)
	return m, cmd
}
