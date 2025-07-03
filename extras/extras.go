// package extras

// import (
// 	"fmt"
// 	"os"

// 	"github.com/charmbracelet/lipgloss"
// 	"golang.org/x/term"
// )

// func (m Model) fourGrid() string {
// 	w, _, err := term.GetSize(int(os.Stdout.Fd()))
// 	boxWidth := (w / 2) - 10
// 	if err != nil {
// 		fmt.Println("Error reading term size:", err)
// 		os.Exit(1)
// 	}

// 	style := lipgloss.NewStyle().
// 		Padding(1, 2).
// 		Align(lipgloss.Center).
// 		Margin(1, 4).
// 		Border(lipgloss.NormalBorder()).
// 		BorderForeground(lipgloss.Color("6")).
// 		Width(boxWidth)

// 	box := func(username string) string {
// 		return style.Render(GetRatingHistory(username))
// 	}

// 	r1 := lipgloss.JoinHorizontal(lipgloss.Top, box("tourist"), box("electr1fy0"))
// 	r2 := lipgloss.JoinHorizontal(lipgloss.Top, box("drv4ever"), box("Aeturnum"))

// 	grid := lipgloss.JoinVertical(lipgloss.Left, r1, r2)

// 	return grid
// }
