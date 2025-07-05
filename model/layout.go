package model

import (
	"fmt"

	"github.com/charmbracelet/lipgloss/v2"
)

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
