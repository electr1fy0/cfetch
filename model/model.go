package model

import (
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss/v2"
	"github.com/electr1fy0/cfetch/data"
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
	spinner            spinner.Model

	ratingPlot string
	ratingData []data.RatingHistory
}

type loadedMsg struct {
	info        table.Model
	ratingTable table.Model
	ratingData  []data.RatingHistory
	ratingPlot  string
	submission  table.Model
	contests    table.Model
}

func initialModel() model {
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

func (m model) View() string {
	switch m.state {
	case Login:

		style := lipgloss.NewStyle().Padding(1, 2)

		title := lipgloss.NewStyle().Bold(true).Width(30).Underline(true).Align(lipgloss.Center).Render("CFETCH")
		m.textinput.Width = 25

		textbox := lipgloss.NewStyle().Border(lipgloss.NormalBorder()).Padding(0, 1).BorderForeground(lipgloss.Green).Render(m.textinput.View())

		hint := lipgloss.NewStyle().Foreground(lipgloss.Color("#A6E3A1")).Render("\n\n(esc to quit at any stage)")

		content := "\n\nEnter your Codeforces username:\n\n"

		return style.Render(title + content + textbox + hint)
	case Loading:
		// w, h, _ := term.GetSize(0)
		style := lipgloss.NewStyle().Padding(1, 2)
		return style.Render(fmt.Sprintf("\tFetching data for %s...\n\n\t%s", m.handle, lipgloss.NewStyle().Foreground(lipgloss.Color("#A6E3A1")).Render(m.spinner.View())))
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
