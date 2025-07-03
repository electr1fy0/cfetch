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
)

type errMsg error

type model struct {
	state      screen
	textinput  textinput.Model
	rating     table.Model
	ratingPlot string
	info       table.Model
	contests   table.Model
	submission table.Model
	err        error
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "tourist"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 20

	return model{
		Login,
		ti, table.New(), "", table.New(), table.New(), table.New(), nil,
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
			handle := m.textinput.Value()
			m.state = Dashboard
			m.info = data.GetUserInfo(handle)
			m.rating, m.ratingPlot = data.GetRatingHistory(handle)
			m.submission = data.GetSubmissionHistory(handle)
			m.contests = data.GetContests()
			return m, cmd
		case tea.KeyEscape:
			return m, tea.Quit
		}
	}
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
		col2 := lipgloss.JoinVertical(lipgloss.Left, style.Render(m.contests.View()), style.Render(m.submission.View()), style.Render(m.rating.View()))

		return lipgloss.JoinHorizontal(lipgloss.Top, col, col2)
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
