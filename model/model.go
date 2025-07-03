package model

import (
	"cfetch/data"
	"fmt"
	"os"

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
	state     screen
	textinput textinput.Model
	rating    string
	info      string
	contests  table.Model
	err       error
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "tourist"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 20

	return model{
		Login,
		ti, "", "", table.New(), nil,
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
			m.state = Dashboard
			m.info = data.GetUserInfo(m.textinput.Value())
			m.rating = data.GetRatingHistory(m.textinput.Value())
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
		borderStyle := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			Padding(1, 2).
			Margin(1, 1).
			BorderForeground(lipgloss.Color("#6C6C6C"))

		infoBox := borderStyle.Render(m.info)
		ratingBox := borderStyle.Render(m.rating)

		contestsBox := m.contests.View() + "\n"
		topRow := lipgloss.JoinHorizontal(lipgloss.Top, infoBox, contestsBox)
		layout := lipgloss.JoinVertical(lipgloss.Left, topRow, ratingBox)

		return layout
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
