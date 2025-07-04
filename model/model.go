package model

import (
	"fmt"
	"os"

	"github.com/electr1fy0/cfetch/data"

	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss/v2"
)

type screen int

const (
	Login screen = iota
	Loading
	Dashboard
	ContestAnalysis
)

type errMsg error

type model struct {
	state              screen
	textinput          textinput.Model
	info               table.Model
	contests           table.Model
	ratingTable        table.Model
	contestSubmissions table.Model
	submission         table.Model
	err                error
	handle             string

	ratingPlot string
	ratingData []data.RatingHistory
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "eg. tourist"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 20

	return model{
		Login,
		ti,
		table.New(), table.New(), table.New(), table.New(), table.New(),
		nil, "", "", nil,
	}
}

func (m model) Init() tea.Cmd {
	return textinput.Blink
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEnter:
			m.handle = m.textinput.Value()
			m.state = Dashboard
			m.info = data.GetUserInfo(m.handle)
			m.ratingTable, m.ratingData, m.ratingPlot = data.GetRatingHistory(m.handle)
			m.submission = data.GetSubmissionHistory(m.handle)
			m.contests = data.GetContests()
			return m, cmd
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
		// switch m.state {
		// case Dashboard:
		// 	m.ratingTable.Update(msg)
		// 	return m, cmd
		// }
	}
	m.ratingTable, cmd = m.ratingTable.Update(msg)
	m.textinput, cmd = m.textinput.Update(msg)
	return m, cmd
}

func (m model) View() string {
	switch m.state {
	case Login:
		return lipgloss.NewStyle().
			Padding(1, 2).
			Render(fmt.Sprintf(
				"Enter your Codeforces username:\n\n%s\n\n(esc to quit)",
				m.textinput.View(),
			))

	case Dashboard:
		style := lipgloss.NewStyle().Padding(1, 2)

		col := lipgloss.JoinVertical(
			lipgloss.Left,
			style.Render(m.info.View()),
			style.Render(m.ratingPlot),
		)

		// var baseStyle = lipgloss.NewStyle().
		// 	BorderStyle(lipgloss.NormalBorder()).
		// 	BorderForeground(lipgloss.Color("240"))

		col2 := lipgloss.JoinVertical(lipgloss.Left, style.Render(m.contests.View()), style.Render(m.submission.View()), style.Render(m.ratingTable.View()))

		return lipgloss.JoinHorizontal(lipgloss.Top, col, col2)

	case ContestAnalysis:
		style := lipgloss.NewStyle().Padding(1, 2)
		s := ""
		if len(m.contestSubmissions.Rows()) == 0 {
			s += "no submissions found"
		} else {
			s += style.Render(m.contestSubmissions.View())
		}
		return s
	}

	return ""
}

func InitiateTUI() {
	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}
